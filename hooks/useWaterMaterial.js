import { useMemo, useRef, useEffect } from 'react'
import { useLoader, useFrame, useThree } from '@react-three/fiber'
import { TextureLoader, RepeatWrapping, MeshStandardMaterial, Color, Vector3, Matrix4, Plane, Vector4, PerspectiveCamera, WebGLRenderTarget, FrontSide } from 'three'

import useTerrainStore from '../store/terrainStore'
import { getWaveUniforms } from '../utils/water/wavePhysics'
import waterCommonVert from '../shaders/water/common.vert.glsl?raw'
import waterCommonFrag from '../shaders/water/common.frag.glsl?raw'
import waterBeginVertex from '../shaders/water/begin_vertex.glsl?raw'
import waterProjectVertex from '../shaders/water/project_vertex.glsl?raw'
import waterWorldposVertex from '../shaders/water/worldpos_vertex.glsl?raw'
import waterNormalFragmentMaps from '../shaders/water/normal_fragment_maps.glsl?raw'
import waterOpaqueFragment from '../shaders/water/opaque_fragment.glsl?raw'

// Deep equality check for waterColor array
const selectWaterColor = (state) => state.waterColor
const waterColorEqual = (a, b) => a && b && a[0] === b[0] && a[1] === b[1] && a[2] === b[2]

/**
 * Custom hook to create and manage water material with reflections.
 * Handles material creation, reflection rendering, and cleanup.
 *
 * @returns {MeshStandardMaterial} The water material with animated reflections
 */
const useWaterMaterial = () => {
	const { gl, scene, camera } = useThree()

	// Get water config from store (only values that require material recreation)
	// Use deep equality comparison for waterColor array to prevent unnecessary re-renders
	const shorelineDepthThreshold = useTerrainStore((state) => state.waterShorelineDepthThreshold)
	const shallowDepthThreshold = useTerrainStore((state) => state.waterShallowDepthThreshold)
	const maxVisibleDepth = useTerrainStore((state) => state.waterMaxVisibleDepth)
	const edgeFadeDistance = useTerrainStore((state) => state.waterEdgeFadeDistance)
	const waterColor = useTerrainStore(selectWaterColor, waterColorEqual)
	const waterLevel = useTerrainStore((state) => state.waterLevel)
	// Note: sunDirection, sunColor, skyColors are now updated in useFrame to avoid rerenders

	// Load water normal texture
	const waterNormals = useLoader(TextureLoader, '/assets/images/ground/water_normal.jpg')
	useEffect(() => {
		if (waterNormals) {
			waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping
		}
	}, [waterNormals])

	// Create reflection render target and related objects
	const reflectionRefs = useRef({
		renderTarget: null,
		mirrorCamera: null,
		textureMatrix: null,
		// Scratch vectors for reflection calculation
		mirrorWorldPosition: new Vector3(0, waterLevel, 0),
		cameraWorldPosition: new Vector3(),
		normal: new Vector3(0, 1, 0), // Water surface normal (up)
		view: new Vector3(),
		target: new Vector3(),
		lookAtPosition: new Vector3(),
		rotationMatrix: new Matrix4(),
		mirrorPlane: new Plane(),
		clipPlane: new Vector4(),
		q: new Vector4(),
		// Track render target size
		rtWidth: 0,
		rtHeight: 0,
		// Reusable objects
		clearColor: new Color(),
	})

	// Initialize reflection objects
	useMemo(() => {
		const refs = reflectionRefs.current
		// Start with a reasonable size, will be resized to match screen
		refs.renderTarget = new WebGLRenderTarget(1024, 1024)
		refs.mirrorCamera = new PerspectiveCamera()
		refs.textureMatrix = new Matrix4()
	}, [])

	// Create shared water material - only recreate when water-specific config changes
	// Environment colors (sun, sky) are updated in useFrame to avoid unnecessary material recreation
	const waterMaterial = useMemo(() => {
		const refs = reflectionRefs.current
		const waveUniforms = getWaveUniforms()
		const material = new MeshStandardMaterial({
			color: new Color(waterColor[0], waterColor[1], waterColor[2]),
			roughness: 0.15,
			metalness: 0.05,
			side: FrontSide,
			transparent: true,
			depthWrite: false,
		})

		material.onBeforeCompile = (shader) => {
			shader.uniforms.normalSampler = { value: waterNormals }
			shader.uniforms.mirrorSampler = { value: refs.renderTarget.texture }
			shader.uniforms.textureMatrix = { value: refs.textureMatrix }
			shader.uniforms.time = { value: 0 }
			shader.uniforms.size = { value: 10.0 }
			shader.uniforms.distortionScale = { value: 8.0 }
			shader.uniforms.sunColor = { value: new Color() }
			shader.uniforms.sunDirection = { value: new Vector3() }
			shader.uniforms.eye = { value: new Vector3() }
			shader.uniforms.waterColor = { value: new Color(waterColor[0], waterColor[1], waterColor[2]) }
			shader.uniforms.skyColor = { value: new Color() }
			shader.uniforms.skyHorizonColor = { value: new Color() }
			shader.uniforms.waveA = { value: waveUniforms.waveA }
			shader.uniforms.waveB = { value: waveUniforms.waveB }
			shader.uniforms.waveC = { value: waveUniforms.waveC }
			shader.uniforms.shorelineDepthThreshold = { value: shorelineDepthThreshold }
			shader.uniforms.shallowDepthThreshold = { value: shallowDepthThreshold }
			shader.uniforms.maxVisibleDepth = { value: maxVisibleDepth }
			shader.uniforms.edgeFadeDistance = { value: edgeFadeDistance }

			shader.vertexShader = shader.vertexShader
				.replace('#include <common>', `#include <common>\n${waterCommonVert}`)
				.replace('#include <begin_vertex>', waterBeginVertex)
				.replace('#include <project_vertex>', waterProjectVertex)
				.replace('#include <worldpos_vertex>', waterWorldposVertex)

			shader.fragmentShader = shader.fragmentShader
				.replace('#include <common>', `#include <common>\n${waterCommonFrag}`)
				.replace('#include <normal_fragment_maps>', waterNormalFragmentMaps)
				.replace('#include <opaque_fragment>', waterOpaqueFragment)

			material.userData.shader = shader
		}

		material.customProgramCacheKey = () => 'water-standard-v1'

		return material
	}, [waterNormals, waterColor, shorelineDepthThreshold, shallowDepthThreshold, maxVisibleDepth, edgeFadeDistance])

	// Store water material ref for cleanup
	const waterMaterialRef = useRef(waterMaterial)
	waterMaterialRef.current = waterMaterial

	// Throttle reflection updates (update every N frames)
	const frameCounter = useRef(0)
	const REFLECTION_UPDATE_INTERVAL = 2 // Update every 2 frames

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			const refs = reflectionRefs.current
			if (refs.renderTarget) {
				refs.renderTarget.dispose()
			}
			if (waterMaterialRef.current) {
				waterMaterialRef.current.dispose()
			}
		}
	}, [])

	// Animate water and update reflections each frame
	useFrame((_, delta) => {
		if (!waterMaterial) return

		const refs = reflectionRefs.current
		const shader = waterMaterial.userData.shader
		if (!shader) return

		// Get environment values from store (doesn't trigger rerenders)
		const { sunDirection, sunColor, skyColorZenith, skyColorHorizon } = useTerrainStore.getState()

		// Update environment uniforms
		shader.uniforms.sunDirection.value.set(sunDirection[0], sunDirection[1], sunDirection[2])
		shader.uniforms.sunColor.value.setRGB(sunColor[0], sunColor[1], sunColor[2])
		shader.uniforms.skyColor.value.setRGB(skyColorZenith[0], skyColorZenith[1], skyColorZenith[2])
		shader.uniforms.skyHorizonColor.value.setRGB(skyColorHorizon[0], skyColorHorizon[1], skyColorHorizon[2])

		// Update time uniform (always needed for wave animation)
		shader.uniforms.time.value += delta

		// Update eye position
		const cameraWorldPosition = refs.cameraWorldPosition
		cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld)
		shader.uniforms.eye.value.copy(cameraWorldPosition)

		// Skip reflection if camera is very far from water (> 1000 units)
		const distanceToWater = Math.abs(cameraWorldPosition.y - waterLevel)
		if (distanceToWater > 1000) return

		// Throttle reflection rendering
		frameCounter.current++
		if (frameCounter.current % REFLECTION_UPDATE_INTERVAL !== 0) {
			return
		}

		// Resize render target to match screen size (at half resolution for performance)
		const pixelRatio = gl.getPixelRatio()
		const targetWidth = Math.floor(gl.domElement.clientWidth * pixelRatio * 0.5)
		const targetHeight = Math.floor(gl.domElement.clientHeight * pixelRatio * 0.5)
		if (refs.rtWidth !== targetWidth || refs.rtHeight !== targetHeight) {
			refs.renderTarget.setSize(targetWidth, targetHeight)
			refs.rtWidth = targetWidth
			refs.rtHeight = targetHeight
		}

		const { renderTarget, mirrorCamera, textureMatrix, mirrorWorldPosition, normal, view, target, lookAtPosition, rotationMatrix, mirrorPlane, clipPlane, q } = refs

		// Water surface is at waterLevel, facing up
		mirrorWorldPosition.set(cameraWorldPosition.x, waterLevel, cameraWorldPosition.z)
		normal.set(0, 1, 0)

		// Check if camera is above water (only render reflection from above)
		view.subVectors(mirrorWorldPosition, cameraWorldPosition)
		if (view.dot(normal) > 0) {
			// Camera is below water, skip reflection
			return
		}

		// Calculate reflection camera position
		view.reflect(normal).negate()
		view.add(mirrorWorldPosition)

		// Calculate look-at target for reflection camera
		rotationMatrix.extractRotation(camera.matrixWorld)
		lookAtPosition.set(0, 0, -1)
		lookAtPosition.applyMatrix4(rotationMatrix)
		lookAtPosition.add(cameraWorldPosition)
		target.subVectors(mirrorWorldPosition, lookAtPosition)
		target.reflect(normal).negate()
		target.add(mirrorWorldPosition)

		// Set up mirror camera
		mirrorCamera.position.copy(view)
		mirrorCamera.up.set(0, 1, 0)
		mirrorCamera.up.applyMatrix4(rotationMatrix)
		mirrorCamera.up.reflect(normal)
		mirrorCamera.lookAt(target)

		// Update mirror camera projection to match main camera
		mirrorCamera.far = camera.far
		mirrorCamera.near = camera.near
		mirrorCamera.fov = camera.fov
		mirrorCamera.aspect = camera.aspect

		mirrorCamera.updateMatrixWorld()
		mirrorCamera.updateProjectionMatrix()

		// Calculate texture matrix
		textureMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1)
		textureMatrix.multiply(mirrorCamera.projectionMatrix)
		textureMatrix.multiply(mirrorCamera.matrixWorldInverse)

		// Set up clip plane for oblique frustum culling
		mirrorPlane.setFromNormalAndCoplanarPoint(normal, mirrorWorldPosition)
		mirrorPlane.applyMatrix4(mirrorCamera.matrixWorldInverse)
		clipPlane.set(mirrorPlane.normal.x, mirrorPlane.normal.y, mirrorPlane.normal.z, mirrorPlane.constant)

		const projectionMatrix = mirrorCamera.projectionMatrix
		const elements = projectionMatrix.elements // Cache array reference
		q.x = (Math.sign(clipPlane.x) + elements[8]) / elements[0]
		q.y = (Math.sign(clipPlane.y) + elements[9]) / elements[5]
		q.z = -1
		q.w = (1 + elements[10]) / elements[14]
		clipPlane.multiplyScalar(2 / clipPlane.dot(q))
		elements[2] = clipPlane.x
		elements[6] = clipPlane.y
		elements[10] = clipPlane.z + 1
		elements[14] = clipPlane.w

		// Render reflection
		const currentRenderTarget = gl.getRenderTarget()
		const currentXrEnabled = gl.xr.enabled
		const currentShadowAutoUpdate = gl.shadowMap.autoUpdate
		gl.getClearColor(refs.clearColor) // Reuse Color instance
		const currentClearAlpha = gl.getClearAlpha()

		// Temporarily hide water tiles by making material invisible
		const originalVisible = waterMaterial.visible
		waterMaterial.visible = false

		gl.xr.enabled = false
		gl.shadowMap.autoUpdate = false
		gl.setRenderTarget(renderTarget)
		gl.state.buffers.depth.setMask(true)

		// Set clear color to sky horizon so unrendered areas blend with sky reflection
		gl.setClearColor(shader.uniforms.skyHorizonColor.value, 1.0)
		gl.clear(true, true, false)

		gl.render(scene, mirrorCamera)

		// Restore state
		waterMaterial.visible = originalVisible
		gl.xr.enabled = currentXrEnabled
		gl.shadowMap.autoUpdate = currentShadowAutoUpdate
		gl.setClearColor(refs.clearColor, currentClearAlpha)
		gl.setRenderTarget(currentRenderTarget)

		const viewport = camera.viewport
		if (viewport !== undefined) {
			gl.state.viewport(viewport)
		}
	})

	return waterMaterial
}

export default useWaterMaterial
