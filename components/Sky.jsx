import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { BackSide, Vector3, Color } from 'three'

import useTerrainStore from '../store/terrainStore'
import skyVertexShader from '../shaders/sky.vert.glsl'
import skyFragmentShader from '../shaders/sky.frag.glsl'

// Custom Atmospheric Sky component with procedural clouds
// Uses shared atmosphere config for consistency with water shader
// Automatically follows camera position each frame
const AtmosphericSky = () => {
	const meshRef = useRef()
	const materialRef = useRef()
	const fogRef = useRef()

	const sunDirection = useTerrainStore((state) => state.sunDirection)
	const sunColor = useTerrainStore((state) => state.sunColor)
	const skyColorZenith = useTerrainStore((state) => state.skyColorZenith)
	const skyColorHorizon = useTerrainStore((state) => state.skyColorHorizon)
	const viewRange = useTerrainStore((state) => state.viewRange)
	const rootSize = useTerrainStore((state) => state.rootSize)

	// Create stable uniforms object once - values updated in useFrame
	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uSunDirection: { value: new Vector3() },
			uSunColor: { value: new Color() },
			uSkyColor: { value: new Color() },
			uSkyHorizonColor: { value: new Color() },
		}),
		[]
	)

	// Stable ambient light color
	const ambientColor = useMemo(() => new Color(), [])

	const geometry = useMemo(() => {
		return [500, 8, 8]
	}, [])

	// Update fog parameters when dependencies change
	useEffect(() => {
		if (!fogRef.current) return
		const fogDistance = viewRange * rootSize
		fogRef.current.color.setRGB(skyColorHorizon[0], skyColorHorizon[1], skyColorHorizon[2])
		fogRef.current.near = fogDistance * 0.5
		fogRef.current.far = fogDistance
	}, [skyColorHorizon, viewRange, rootSize])

	useFrame((state) => {
		const mesh = meshRef.current
		if (!mesh) return

		// Update sky position to match camera position
		mesh.position.copy(state.camera.position)

		// Update uniforms with current values
		if (materialRef.current) {
			const u = materialRef.current.uniforms
			u.uTime.value = state.clock.elapsedTime
			u.uSunDirection.value.set(sunDirection[0], sunDirection[1], sunDirection[2])
			u.uSunColor.value.setRGB(sunColor[0], sunColor[1], sunColor[2])
			u.uSkyColor.value.setRGB(skyColorZenith[0], skyColorZenith[1], skyColorZenith[2])
			u.uSkyHorizonColor.value.setRGB(skyColorHorizon[0], skyColorHorizon[1], skyColorHorizon[2])
		}

		// Update ambient light color
		ambientColor.setRGB(skyColorZenith[0], skyColorZenith[1], skyColorZenith[2])
	})

	return (
		<>
			<fog ref={fogRef} attach='fog' />

			<Environment files='assets/images/envmap/rustig_koppie_puresky_1k.hdr' environmentIntensity={0.3} />

			<ambientLight ref={(light) => light && (light.color = ambientColor)} intensity={2.0} />

			<mesh ref={meshRef} frustumCulled={false}>
				<sphereGeometry args={geometry} />
				<shaderMaterial ref={materialRef} uniforms={uniforms} vertexShader={skyVertexShader} fragmentShader={skyFragmentShader} side={BackSide} depthWrite={false} />
			</mesh>
		</>
	)
}

export default AtmosphericSky
