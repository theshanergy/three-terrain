import { useControls, folder } from 'leva'
import useTerrainStore from '../store/terrainStore'
import { getBiomePresetList } from '../store/terrainStore'
import { normalizeDirection } from '../utils/vectorHelpers'

/**
 * Configuration defining all terrain controls
 * Each entry specifies: stateKey, setter, min, max, step, and optional type/subcontrols
 */
const CONTROLS_CONFIG = {
	Terrain: {
		generation: {
			type: 'folder',
			collapsed: true,
			controls: {
				seed: { stateKey: 'seed', setter: 'setSeed', min: 0, max: 10000, step: 1 },
				baseHeightScale: { stateKey: 'baseHeightScale', setter: 'setBaseHeightScale', min: 0, max: 20, step: 0.1 },
				maxMountainHeight: { stateKey: 'maxMountainHeight', setter: 'setMaxMountainHeight', min: 0, max: 1000, step: 10 },
			},
		},
		noiseScales: {
			type: 'folder',
			collapsed: true,
			controls: {
				continent: { stateKey: 'continentScale', setter: 'setContinentScale', min: 0.00001, max: 0.001, step: 0.00001 },
				detail: { stateKey: 'noiseScale', setter: 'setNoiseScale', min: 0.001, max: 0.2, step: 0.001 },
				mountain: { stateKey: 'mountainScale', setter: 'setMountainScale', min: 0.0001, max: 0.01, step: 0.0001 },
			},
		},
		spawnArea: {
			type: 'folder',
			collapsed: true,
			controls: {
				radius: { stateKey: 'spawnRadius', setter: 'setSpawnRadius', min: 0, max: 1000, step: 10 },
				transitionRadius: { stateKey: 'spawnTransitionRadius', setter: 'setSpawnTransitionRadius', min: 0, max: 5000, step: 50 },
			},
		},
		lod: {
			type: 'folder',
			collapsed: true,
			controls: {
				splitFactor: { stateKey: 'lodSplitFactor', setter: 'setLodSplitFactor', min: 1, max: 4, step: 0.1 },
				hysteresis: { stateKey: 'lodHysteresis', setter: 'setLodHysteresis', min: 1, max: 2, step: 0.05 },
				minTileSize: { stateKey: 'minTileSize', setter: 'setMinTileSize', min: 8, max: 128, step: 8 },
				rootSize: { stateKey: 'rootSize', setter: 'setRootSize', min: 1024, max: 8192, step: 256 },
				tileResolution: { stateKey: 'tileResolution', setter: 'setTileResolution', min: 8, max: 64, step: 1 },
				viewRange: { stateKey: 'viewRange', setter: 'setViewRange', min: 1, max: 20, step: 1 },
			},
		},
	},
	Sun: {
		direction: { type: 'vec3', stateKey: 'sunDirection', setter: 'setSunDirection' },
		color: { type: 'color', stateKey: 'sunColor', setter: 'setSunColor' },
	},
	Sky: {
		zenith: { type: 'color', stateKey: 'skyColorZenith', setter: 'setSkyColorZenith' },
		horizon: { type: 'color', stateKey: 'skyColorHorizon', setter: 'setSkyColorHorizon' },
	},
	Vegetation: {
		enabled: { type: 'boolean', stateKey: 'vegetationEnabled', setter: 'setVegetationEnabled' },
		density: { stateKey: 'vegetationDensity', setter: 'setVegetationDensity', min: 0, max: 2, step: 0.1 },
	},
	Water: {
		enabled: { type: 'boolean', stateKey: 'waterEnabled', setter: 'setWaterEnabled' },
		level: { stateKey: 'waterLevel', setter: 'setWaterLevel', min: -50, max: 50, step: 1 },
		color: { type: 'color', stateKey: 'waterColor', setter: 'setWaterColor' },
		depth: {
			type: 'folder',
			collapsed: true,
			controls: {
				maxDepth: { stateKey: 'waterMaxDepth', setter: 'setWaterMaxDepth', min: 10, max: 100, step: 1 },
				maxVisibleDepth: { stateKey: 'waterMaxVisibleDepth', setter: 'setWaterMaxVisibleDepth', min: 1, max: 20, step: 0.5 },
				shorelineThreshold: { stateKey: 'waterShorelineDepthThreshold', setter: 'setWaterShorelineDepthThreshold', min: 0, max: 10, step: 0.1 },
				shallowThreshold: { stateKey: 'waterShallowDepthThreshold', setter: 'setWaterShallowDepthThreshold', min: 0, max: 50, step: 0.5 },
			},
		},
		rendering: {
			type: 'folder',
			collapsed: true,
			controls: {
				edgeFadeDistance: { stateKey: 'waterEdgeFadeDistance', setter: 'setWaterEdgeFadeDistance', min: 0, max: 1, step: 0.01 },
			},
		},
	},
}

/**
 * Create a control based on its configuration
 */
const createControl = (config, initialState) => {
	const store = useTerrainStore.getState()

	// Handle special control types
	if (config.type === 'boolean') {
		return {
			value: initialState[config.stateKey],
			onChange: (value) => store[config.setter](value),
		}
	}

	if (config.type === 'vec3') {
		const vec = initialState[config.stateKey]
		return {
			value: { x: vec[0], y: vec[1], z: vec[2] },
			onChange: (value) => {
				store[config.setter](normalizeDirection([value.x, value.y, value.z]))
			},
		}
	}

	if (config.type === 'color') {
		const rgb = initialState[config.stateKey]
		// Convert RGB array [r, g, b] to RGB object { r: 0-255, g: 0-255, b: 0-255 }
		return {
			value: { r: Math.round(rgb[0] * 255), g: Math.round(rgb[1] * 255), b: Math.round(rgb[2] * 255) },
			onChange: (value) => {
				// Convert back to normalized RGB array [0-1, 0-1, 0-1]
				store[config.setter]([value.r / 255, value.g / 255, value.b / 255])
			},
		}
	}

	if (config.type === 'folder') {
		const controls = {}
		Object.entries(config.controls).forEach(([key, subConfig]) => {
			controls[key] = createControl(subConfig, initialState)
		})
		return folder(controls, { collapsed: config.collapsed })
	}

	// Default number control
	return {
		value: initialState[config.stateKey],
		min: config.min,
		max: config.max,
		step: config.step,
		onChange: (value) => store[config.setter](value),
	}
}

/**
 * Build controls object from configuration
 */
const buildControls = (config, initialState) => {
	const controls = {}
	Object.entries(config).forEach(([key, controlConfig]) => {
		controls[key] = createControl(controlConfig, initialState)
	})
	return controls
}

/**
 * GUI - Leva UI panel for runtime terrain configuration
 * Exposes biome presets and all terrain generation parameters for real-time tweaking
 */
const GUI = () => {
	const initialState = useTerrainStore.getState()

	// Biome presets
	const biomePresetList = getBiomePresetList()
	const biomePresetOptions = biomePresetList.reduce((acc, preset) => {
		acc[preset.name] = preset.id
		return acc
	}, {})

	useControls('Biome Presets', {
		preset: {
			value: 'desert',
			options: biomePresetOptions,
			onChange: (value) => useTerrainStore.getState().applyPresetById(value),
		},
	})

	// Generate all controls from config
	Object.entries(CONTROLS_CONFIG).forEach(([panelName, panelConfig]) => {
		useControls(panelName, buildControls(panelConfig, initialState))
	})

	return null
}

export default GUI
