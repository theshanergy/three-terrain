import { create } from 'zustand'
import { hslToRgb } from '../utils/colorHelpers'
import { normalizeDirection } from '../utils/vectorHelpers'

// Pre-compute initial values
const initialSunDir = normalizeDirection([0.545, 0.365, 0.4])
const initialSunColor = hslToRgb(0.1, 1.0, 0.93)
const initialSkyZenith = hslToRgb(0.58, 0.57, 0.59)
const initialSkyHorizon = hslToRgb(0.58, 0.67, 0.85)

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
	sunDirection: initialSunDir,
	sunColor: initialSunColor,

	// Sky colors - stored as [r, g, b] arrays
	skyColorZenith: initialSkyZenith,
	skyColorHorizon: initialSkyHorizon,

	setSunDirection: (direction) => set({ sunDirection: direction }),
	setSunColor: (color) => set({ sunColor: color }),
	setSkyColorZenith: (color) => set({ skyColorZenith: color }),
	setSkyColorHorizon: (color) => set({ skyColorHorizon: color }),

	// ========================================
	// TERRAIN CONFIGURATION
	// ========================================
	// Deterministic seed for terrain generation
	seed: 1234,

	// Height Scaling
	baseHeightScale: 4,

	// Noise Scales
	continentScale: 0.00007,
	noiseScale: 0.04,
	mountainScale: 0.001,

	// Height Limits
	maxMountainHeight: 400,

	// Spawn Area - flat safe zone that transitions to natural terrain
	spawnRadius: 200,
	spawnTransitionRadius: 2500,

	// LOD settings
	lodSplitFactor: 2,
	lodHysteresis: 1.2,
	minTileSize: 32,
	rootSize: 4096,
	tileResolution: 16,

	// Terrain Layers
	layers: [
		{
			name: 'rock',
			textures: {
				albedo: '/assets/images/ground/dark_rough_rock_albedo.jpg',
				normal: '/assets/images/ground/dark_rough_rock_normal.jpg',
			},
			textureScale: 0.02,
			lod: {
				distance: 400,
				levels: 3,
			},
		},
		{
			name: 'sand',
			textures: {
				albedo: '/assets/images/ground/sand.jpg',
				normal: '/assets/images/ground/sand_normal.jpg',
			},
			textureScale: 0.4,
			normalScale: 0.5,
			height: {
				min: -1,
				max: 45,
				transitionMin: 3,
				transitionMax: 55,
				influence: 1.0,
			},
			slope: {
				max: 0.05,
				influence: 0.9,
				transition: 0.03,
			},
		},
		{
			name: 'snow',
			textures: {
				albedo: '/assets/images/ground/snow.jpg',
				normal: '/assets/images/ground/snow_normal.jpg',
			},
			textureScale: 0.025,
			normalScale: 0.5,
			height: {
				min: 220,
				transitionMin: 55.0,
				influence: 1.0,
			},
			lod: {
				distance: 300,
				levels: 3,
			},
		},
	],

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
	vegetation: [],
	setVegetation: (vegetationUpdater) =>
		set((state) => ({
			vegetation: typeof vegetationUpdater === 'function' ? vegetationUpdater(state.vegetation) : vegetationUpdater,
		})),
	
	// Vegetation controls
	vegetationEnabled: true,
	vegetationDensity: 1.0,
	setVegetationEnabled: (enabled) => set({ vegetationEnabled: enabled }),
	setVegetationDensity: (density) => set({ vegetationDensity: density }),

	// ========================================
	// WATER CONFIGURATION
	// ========================================
	waterEnabled: true,
	waterLevel: 0,
	waterMaxDepth: 50,
	waterShorelineDepthThreshold: 2.5,
	waterShallowDepthThreshold: 20.0,
	waterMaxVisibleDepth: 8.0,
	waterEdgeFadeDistance: 0.1,
	waterColor: [0.0, 0.12, 0.06],
	
	setWaterEnabled: (enabled) => set({ waterEnabled: enabled }),
	setWaterLevel: (level) => set({ waterLevel: level }),
	setWaterMaxDepth: (depth) => set({ waterMaxDepth: depth }),
	setWaterShorelineDepthThreshold: (threshold) => set({ waterShorelineDepthThreshold: threshold }),
	setWaterShallowDepthThreshold: (threshold) => set({ waterShallowDepthThreshold: threshold }),
	setWaterMaxVisibleDepth: (depth) => set({ waterMaxVisibleDepth: depth }),
	setWaterEdgeFadeDistance: (distance) => set({ waterEdgeFadeDistance: distance }),
	setWaterColor: (color) => set({ waterColor: color }),
}))

export default useTerrainStore
