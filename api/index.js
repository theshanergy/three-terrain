/**
 * Three Terrain API
 *
 * This module exports the public API for integrating the terrain system
 * into external projects like 4x4 Builder or other Three.js applications.
 */

// Core terrain components
export { default as Terrain } from '../components/scene/environment/terrain/Terrain'
export { default as TerrainTile } from '../components/scene/environment/terrain/TerrainTile'
export { default as Vegetation } from '../components/scene/environment/terrain/Vegetation'

// Environment components
export { default as Environment } from '../components/scene/environment/Environment'
export { default as Sun } from '../components/scene/environment/Sun'
export { default as Sky } from '../components/scene/environment/Sky'

// Hooks
export { default as useTerrainQuadtree } from '../hooks/useTerrainQuadtree'
export { default as useTerrainGeometry } from '../hooks/useTerrainGeometry'
export { default as useTerrainMaterial } from '../hooks/useTerrainMaterial'
export { default as useWaterMaterial } from '../hooks/useWaterMaterial'
export { default as useVegetation } from '../hooks/useVegetation'
export { default as useElevationBounds } from '../hooks/useElevationBounds'
export {
	useBiome,
	useBiomeTerrain,
	useBiomeEnvironment,
	useBiomeVegetation,
	useBiomeWater,
	useBiomeConfig
} from '../hooks/useBiome'

// State management
export { default as useTerrainStore } from '../store/terrainStore'

// Configuration
export { BIOMES, DEFAULT_BIOME, getBiome, getBiomeList } from '../config/biomes'
export * from '../config/lod'

// Utilities
export { createTerrainHelpers } from '../utils/terrain/heightSampler'
export { QuadtreeNode, getEdgeStitchInfo } from '../utils/terrain/quadtree'
export { createGrassMesh } from '../utils/vegetation/grassMesh'
export { generateVegetationForType } from '../utils/terrain/vegetationGeneration'
export { seededRandom, SeededRandom } from '../utils/seededRandom'

/**
 * TerrainSystem - A ready-to-use terrain component with all dependencies
 *
 * Usage:
 * ```jsx
 * import { TerrainSystem } from 'three-terrain'
 *
 * function MyScene() {
 *   return (
 *     <Canvas>
 *       <TerrainSystem biome="desert" />
 *     </Canvas>
 *   )
 * }
 * ```
 */
export { default as TerrainSystem } from '../components/scene/environment/Environment'

/**
 * getTerrainHeight - Get terrain height at any world position
 *
 * Usage:
 * ```js
 * import { useTerrainStore } from 'three-terrain'
 *
 * const height = useTerrainStore.getState().getTerrainHeight?.(x, z)
 * ```
 */

/**
 * getTerrainNormal - Get terrain normal at any world position
 *
 * Usage:
 * ```js
 * import { useTerrainStore } from 'three-terrain'
 *
 * const normal = useTerrainStore.getState().getTerrainNormal?.(x, z)
 * ```
 */
