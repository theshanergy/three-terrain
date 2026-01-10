import { create } from 'zustand'
import { DEFAULT_BIOME, BIOMES } from '../config/biomes'

/**
 * Terrain store - manages terrain generation state and configuration
 * This is the primary state management for the three-terrain package
 */
const useTerrainStore = create((set, get) => ({
	// Scene state
	sceneLoaded: false,
	setSceneLoaded: (loaded) => set({ sceneLoaded: loaded }),

	// Performance state
	performanceDegraded: false,
	setPerformanceDegraded: (degraded) => set({ performanceDegraded: degraded }),

	// Terrain height/normal functions (set by terrain helpers)
	getTerrainHeight: null,
	getTerrainNormal: null,
	setTerrainHeightFunction: (fn) => set({ getTerrainHeight: fn }),
	setTerrainNormalFunction: (fn) => set({ getTerrainNormal: fn }),

	// Biome state
	currentBiome: (() => {
		if (typeof localStorage !== 'undefined') {
			const storedBiome = localStorage.getItem('currentBiome')
			if (storedBiome && BIOMES[storedBiome]) return storedBiome
		}
		return DEFAULT_BIOME
	})(),
	setBiome: (biomeName) =>
		set((state) => {
			// Validate biome exists
			if (!BIOMES[biomeName]) {
				console.warn(`Biome "${biomeName}" not found, using default`)
				return state
			}

			// Store in localStorage
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('currentBiome', biomeName)
			}

			return { currentBiome: biomeName }
		}),

	// Get current biome configuration
	getBiomeConfig: () => BIOMES[get().currentBiome],

	// Notification state (for terrain loading feedback, etc.)
	notification: null,
	showNotification: (notificationData) => set({ notification: { ...notificationData, id: Date.now() } }),
	hideNotification: () => set({ notification: null }),

	// Camera state
	cameraMode: 'orbit',
	cameraAutoRotate: false,
	setCameraMode: (mode) => set({ cameraMode: mode }),
	setCameraAutoRotate: (autoRotate) => set({ cameraAutoRotate: autoRotate }),

	// Terrain configuration overrides (allows runtime tweaking via Leva)
	terrainConfig: {
		// LOD settings
		lodSplitFactor: 2,
		lodHysteresis: 1.2,
		minTileSize: 32,
		rootSize: 4096,
		tileResolution: 16,

		// Noise settings (can be overridden per-biome)
		baseHeightScale: null, // null = use biome default
		continentScale: null,
		noiseScale: null,
		mountainScale: null,
		maxMountainHeight: null,

		// Vegetation
		vegetationEnabled: true,
		vegetationDensity: 1.0,

		// Water
		waterEnabled: true,
		waterLevel: 0,
	},
	setTerrainConfig: (configUpdater) =>
		set((state) => ({
			terrainConfig:
				typeof configUpdater === 'function' ? { ...state.terrainConfig, ...configUpdater(state.terrainConfig) } : { ...state.terrainConfig, ...configUpdater },
		})),
}))

export default useTerrainStore
