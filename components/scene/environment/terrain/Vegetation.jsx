import { useMemo, useEffect, memo } from 'react'
import { InstancedMesh, Matrix4 } from 'three'

import useTerrainStore from '../../../../store/terrainStore'
import useVegetation from '../../../../hooks/useVegetation'
import { generateVegetationForType } from '../../../../utils/terrain/vegetationGeneration'
import { getTerrainHelpers } from '../../../../utils/terrain/heightSampler'

/**
 * Custom comparison for Vegetation props.
 * Prevents unnecessary re-renders when props haven't meaningfully changed.
 */
const arePropsEqual = (prevProps, nextProps) => {
	// Check node properties that affect vegetation placement
	if (
		prevProps.node.key !== nextProps.node.key ||
		prevProps.node.size !== nextProps.node.size ||
		prevProps.node.centerX !== nextProps.node.centerX ||
		prevProps.node.centerZ !== nextProps.node.centerZ
	) {
		return false
	}

	return true
}

/**
 * Vegetation - Renders instanced vegetation meshes for a terrain tile.
 *
 * @param {Object} props
 * @param {Object} props.node - Quadtree node with centerX, centerZ, size, key
 */
const Vegetation = memo(({ node }) => {
	// Get data from store and hooks
	const performanceDegraded = useTerrainStore((state) => state.performanceDegraded)
	const vegetationModels = useVegetation()
	const showVegetation = !performanceDegraded

	// Generate vegetation instances for this tile
	const vegetationInstances = useMemo(() => {
		if (!vegetationModels || !showVegetation) return null

		const terrainHelpers = getTerrainHelpers()
		const allInstances = []

		// Reusable scratch object for transform composition
		const composedMatrix = new Matrix4()

		// Generate instances for each vegetation type
		vegetationModels.forEach((vegetationType, typeIndex) => {
			// Get available LOD levels for this vegetation type (sorted ascending)
			const availableLods = Object.keys(vegetationType.lods)
				.map(Number)
				.sort((a, b) => a - b)

			// Determine which LOD to use
			let actualLod = node.lod

			if (!vegetationType.lods[actualLod]) {
				const maxAvailableLod = availableLods[availableLods.length - 1]

				if (node.lod > maxAvailableLod) {
					actualLod = maxAvailableLod
				} else {
					return
				}
			}

			const lodMeshes = vegetationType.lods[actualLod]
			if (!lodMeshes?.length) return

			// Check if this vegetation type should render at this LOD level
			if (vegetationType.config.maxLod !== undefined && actualLod > vegetationType.config.maxLod) {
				return
			}

			// Generate vegetation matrices for this type
			const vegetationMatrices = generateVegetationForType(node, terrainHelpers, actualLod, vegetationType.config, typeIndex)

			if (vegetationMatrices.length === 0) {
				return
			}

			// Create instanced meshes for each part of this vegetation type
			lodMeshes.forEach((meshData, meshIndex) => {
				const instancedMesh = new InstancedMesh(meshData.geometry, meshData.material, vegetationMatrices.length)
				instancedMesh.castShadow = true
				instancedMesh.receiveShadow = true
				instancedMesh.frustumCulled = true

				// Set all matrices, composing with the mesh's baked transform
				vegetationMatrices.forEach((matrix, i) => {
					composedMatrix.multiplyMatrices(matrix, meshData.transform)
					instancedMesh.setMatrixAt(i, composedMatrix)
				})
				instancedMesh.instanceMatrix.needsUpdate = true

				allInstances.push({
					mesh: instancedMesh,
					key: `${vegetationType.name}-${meshIndex}`,
				})
			})
		})

		return allInstances.length > 0 ? allInstances : null
	}, [node.key, node.size, node.lod, vegetationModels, showVegetation])

	// Cleanup vegetation instances
	useEffect(() => {
		return () => {
			if (vegetationInstances) {
				vegetationInstances.forEach(({ mesh }) => {
					mesh.dispose()
				})
			}
		}
	}, [vegetationInstances])

	// Vegetation is positioned in world space, not relative to tile
	return (
		<>
			{vegetationInstances && vegetationInstances.map(({ mesh, key }, index) => <primitive key={`vegetation-${node.key}-${key}-${index}`} object={mesh} />)}
		</>
	)
}, arePropsEqual)

export default Vegetation
