import { create } from 'zustand'
import { normalizeDirection } from '../utils/vectorHelpers'
import desertPreset from '../presets/desert'
import mountainPreset from '../presets/mountain'
import winterPreset from '../presets/winter'

const BIOME_PRESETS = {
	desert: desertPreset,
	mountain: mountainPreset,
	winter: winterPreset,
}

/**
 * Get list of available biome presets for UI
 * @returns {Array} Array of biome preset metadata objects
 */
export function getBiomePresetList() {
	return Object.entries(BIOME_PRESETS).map(([key, preset]) => ({
		id: key,
		name: preset.name,
		description: preset.description,
	}))
}

/**
 * Terrain store - manages terrain generation state and configuration
 * This is the primary state management for the three-terrain package
 * All biome configurations are now unified in this flattened top-level state
 *
 * State has been flattened for improved performance and simpler access patterns.
 * Components can now subscribe to individual state properties rather than entire objects,
 * reducing unnecessary re-renders.
 *
 * IMPORTANT: Sun/sky colors and directions are stored as primitive arrays [x, y, z] or [r, g, b]
 * to prevent unnecessary rerenders from Zustand's shallow comparison detecting new object references.
 * Components should create THREE.js objects (Vector3, Color) locally when needed.
 */
const useTerrainStore = create((set, get) => ({
	// Scene state
	sceneLoaded: false,
	setSceneLoaded: (loaded) => set({ sceneLoaded: loaded }),

	// Performance state
	performanceDegraded: false,
	setPerformanceDegraded: (degraded) => set({ performanceDegraded: degraded }),

	// Notification state (for terrain loading feedback, etc.)
	notification: null,
	showNotification: (notificationData) => set({ notification: { ...notificationData, id: Date.now() } }),
	hideNotification: () => set({ notification: null }),

	// ========================================
	// ENVIRONMENT CONFIGURATION
	// ========================================
	// Sun configuration - stored as primitive arrays to prevent rerender cascades
	// sunDirection: [x, y, z] normalized direction vector
	// sunColor: [r, g, b] RGB values (0-1)
	sunDirection: normalizeDirection(desertPreset.sunDirection),
	sunColor: desertPreset.sunColor,

	// Sky colors - stored as [r, g, b] arrays
	skyColorZenith: desertPreset.skyColorZenith,
	skyColorHorizon: desertPreset.skyColorHorizon,

	setSunDirection: (direction) => set({ sunDirection: direction }),
	setSunColor: (color) => set({ sunColor: color }),
	setSkyColorZenith: (color) => set({ skyColorZenith: color }),
	setSkyColorHorizon: (color) => set({ skyColorHorizon: color }),

	// ========================================
	// TERRAIN CONFIGURATION
	// ========================================
	// Deterministic seed for terrain generation
	seed: desertPreset.seed,

	// Height Scaling
	baseHeightScale: desertPreset.baseHeightScale,

	// Noise Scales
	continentScale: desertPreset.continentScale,
	noiseScale: desertPreset.noiseScale,
	mountainScale: desertPreset.mountainScale,

	// Height Limits
	maxMountainHeight: desertPreset.maxMountainHeight,

	// Spawn Area - flat safe zone that transitions to natural terrain
	spawnRadius: desertPreset.spawnRadius,
	spawnTransitionRadius: desertPreset.spawnTransitionRadius,

	// LOD settings
	lodSplitFactor: 2,
	lodHysteresis: 1.2,
	minTileSize: 32,
	rootSize: 4096,
	tileResolution: 16,

	// Computed LOD value - maximum quadtree depth (root node LOD level)
	// LOD 0 is highest resolution (smallest tiles)
	get maxQuadtreeDepth() {
		return Math.log2(this.rootSize / this.minTileSize)
	},

	// Terrain Layers
	layers: desertPreset.layers,

	setSeed: (seed) => set({ seed }),
	setBaseHeightScale: (scale) => set({ baseHeightScale: scale }),
	setContinentScale: (scale) => set({ continentScale: scale }),
	setNoiseScale: (scale) => set({ noiseScale: scale }),
	setMountainScale: (scale) => set({ mountainScale: scale }),
	setMaxMountainHeight: (height) => set({ maxMountainHeight: height }),
	setSpawnRadius: (radius) => set({ spawnRadius: radius }),
	setSpawnTransitionRadius: (radius) => set({ spawnTransitionRadius: radius }),
	setLodSplitFactor: (factor) => set({ lodSplitFactor: factor }),
	setLodHysteresis: (hysteresis) => set({ lodHysteresis: hysteresis }),
	setMinTileSize: (size) => set({ minTileSize: size }),
	setRootSize: (size) => set({ rootSize: size }),
	setTileResolution: (resolution) => set({ tileResolution: resolution }),
	setLayers: (layers) => set({ layers }),

	// ========================================
	// VEGETATION CONFIGURATION
	// ========================================
	vegetation: desertPreset.vegetation,
	setVegetation: (vegetationUpdater) =>
		set((state) => ({
			vegetation: typeof vegetationUpdater === 'function' ? vegetationUpdater(state.vegetation) : vegetationUpdater,
		})),

	// Vegetation controls
	vegetationEnabled: desertPreset.vegetationEnabled,
	vegetationDensity: desertPreset.vegetationDensity,
	setVegetationEnabled: (enabled) => set({ vegetationEnabled: enabled }),
	setVegetationDensity: (density) => set({ vegetationDensity: density }),

	// ========================================
	// WATER CONFIGURATION
	// ========================================
	waterEnabled: desertPreset.waterEnabled,
	waterLevel: desertPreset.waterLevel,
	waterMaxDepth: desertPreset.waterMaxDepth,
	waterShorelineDepthThreshold: desertPreset.waterShorelineDepthThreshold,
	waterShallowDepthThreshold: desertPreset.waterShallowDepthThreshold,
	waterMaxVisibleDepth: desertPreset.waterMaxVisibleDepth,
	waterEdgeFadeDistance: desertPreset.waterEdgeFadeDistance,
	waterColor: desertPreset.waterColor,

	setWaterEnabled: (enabled) => set({ waterEnabled: enabled }),
	setWaterLevel: (level) => set({ waterLevel: level }),
	setWaterMaxDepth: (depth) => set({ waterMaxDepth: depth }),
	setWaterShorelineDepthThreshold: (threshold) => set({ waterShorelineDepthThreshold: threshold }),
	setWaterShallowDepthThreshold: (threshold) => set({ waterShallowDepthThreshold: threshold }),
	setWaterMaxVisibleDepth: (depth) => set({ waterMaxVisibleDepth: depth }),
	setWaterEdgeFadeDistance: (distance) => set({ waterEdgeFadeDistance: distance }),
	setWaterColor: (color) => set({ waterColor: color }),

	// ========================================
	// PRESET APPLICATION
	// ========================================
	/**
	 * Apply a preset configuration to the store
	 * Presets are pure config objects with properties matching the store state
	 * @param {Object} preset - Preset configuration object
	 */
	applyPreset: (preset) => {
		const updates = {}

		// Environment
		if (preset.sunDirection !== undefined) updates.sunDirection = normalizeDirection(preset.sunDirection)
		if (preset.sunColor !== undefined) updates.sunColor = preset.sunColor
		if (preset.skyColorZenith !== undefined) updates.skyColorZenith = preset.skyColorZenith
		if (preset.skyColorHorizon !== undefined) updates.skyColorHorizon = preset.skyColorHorizon

		// Terrain
		if (preset.seed !== undefined) updates.seed = preset.seed
		if (preset.baseHeightScale !== undefined) updates.baseHeightScale = preset.baseHeightScale
		if (preset.continentScale !== undefined) updates.continentScale = preset.continentScale
		if (preset.noiseScale !== undefined) updates.noiseScale = preset.noiseScale
		if (preset.mountainScale !== undefined) updates.mountainScale = preset.mountainScale
		if (preset.maxMountainHeight !== undefined) updates.maxMountainHeight = preset.maxMountainHeight
		if (preset.spawnRadius !== undefined) updates.spawnRadius = preset.spawnRadius
		if (preset.spawnTransitionRadius !== undefined) updates.spawnTransitionRadius = preset.spawnTransitionRadius
		if (preset.layers !== undefined) updates.layers = preset.layers

		// Vegetation
		if (preset.vegetation !== undefined) updates.vegetation = preset.vegetation
		if (preset.vegetationEnabled !== undefined) updates.vegetationEnabled = preset.vegetationEnabled
		if (preset.vegetationDensity !== undefined) updates.vegetationDensity = preset.vegetationDensity

		// Water
		if (preset.waterEnabled !== undefined) updates.waterEnabled = preset.waterEnabled
		if (preset.waterLevel !== undefined) updates.waterLevel = preset.waterLevel
		if (preset.waterMaxDepth !== undefined) updates.waterMaxDepth = preset.waterMaxDepth
		if (preset.waterShorelineDepthThreshold !== undefined) updates.waterShorelineDepthThreshold = preset.waterShorelineDepthThreshold
		if (preset.waterShallowDepthThreshold !== undefined) updates.waterShallowDepthThreshold = preset.waterShallowDepthThreshold
		if (preset.waterMaxVisibleDepth !== undefined) updates.waterMaxVisibleDepth = preset.waterMaxVisibleDepth
		if (preset.waterEdgeFadeDistance !== undefined) updates.waterEdgeFadeDistance = preset.waterEdgeFadeDistance
		if (preset.waterColor !== undefined) updates.waterColor = preset.waterColor

		set(updates)
	},

	/**
	 * Apply a preset by ID
	 * @param {string} presetId - The ID of the preset to apply (e.g., 'desert', 'mountain', 'winter')
	 */
	applyPresetById: (presetId) => {
		const preset = BIOME_PRESETS[presetId]
		if (preset) {
			get().applyPreset(preset)
		}
	},
}))

export default useTerrainStore
