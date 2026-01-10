import { useControls, folder } from 'leva'
import useTerrainStore from '../store/terrainStore'
import { getBiomePresetList, applyBiomePreset } from '../presets'
import { rgbToHsl, hslToRgb } from '../utils/colorHelpers'
import { normalizeDirection } from '../utils/vectorHelpers'

/**
 * TerrainControls - Leva UI panel for runtime terrain configuration
 * Exposes biome presets and all terrain generation parameters for real-time tweaking
 *
 * Gets initial values from store state and uses onChange to update store.
 */
const TerrainControls = () => {
	// Get initial state values
	const initialState = useTerrainStore.getState()

	// Get available biome presets for dropdown
	const biomePresetList = getBiomePresetList()
	const biomePresetOptions = biomePresetList.reduce((acc, preset) => {
		acc[preset.name] = preset.id
		return acc
	}, {})

	// Biome preset selection control
	useControls('Biome Presets', {
		preset: {
			value: 'desert',
			options: biomePresetOptions,
			onChange: (value) => {
				applyBiomePreset(value, useTerrainStore.getState())
			},
		},
	})

	// Environment controls - sunDirection is now [x, y, z] array
	useControls('Environment', {
		'Sun Direction': folder({
			sunDirX: {
				value: initialState.sunDirection[0],
				min: -1,
				max: 1,
				step: 0.01,
				label: 'X',
				onChange: (value) => {
					const dir = useTerrainStore.getState().sunDirection
					useTerrainStore.getState().setSunDirection(normalizeDirection([value, dir[1], dir[2]]))
				},
			},
			sunDirY: {
				value: initialState.sunDirection[1],
				min: -1,
				max: 1,
				step: 0.01,
				label: 'Y',
				onChange: (value) => {
					const dir = useTerrainStore.getState().sunDirection
					useTerrainStore.getState().setSunDirection(normalizeDirection([dir[0], value, dir[2]]))
				},
			},
			sunDirZ: {
				value: initialState.sunDirection[2],
				min: -1,
				max: 1,
				step: 0.01,
				label: 'Z',
				onChange: (value) => {
					const dir = useTerrainStore.getState().sunDirection
					useTerrainStore.getState().setSunDirection(normalizeDirection([dir[0], dir[1], value]))
				},
			},
		}),
		'Sun Color': folder({
			sunHue: {
				value: 0.1,
				min: 0,
				max: 1,
				step: 0.01,
				label: 'Hue',
				onChange: (value) => {
					const hsl = rgbToHsl(useTerrainStore.getState().sunColor)
					useTerrainStore.getState().setSunColor(hslToRgb(value, hsl.s, hsl.l))
				},
			},
			sunSat: {
				value: 1.0,
				min: 0,
				max: 1,
				step: 0.01,
				label: 'Saturation',
				onChange: (value) => {
					const hsl = rgbToHsl(useTerrainStore.getState().sunColor)
					useTerrainStore.getState().setSunColor(hslToRgb(hsl.h, value, hsl.l))
				},
			},
			sunLight: {
				value: 0.93,
				min: 0,
				max: 1,
				step: 0.01,
				label: 'Lightness',
				onChange: (value) => {
					const hsl = rgbToHsl(useTerrainStore.getState().sunColor)
					useTerrainStore.getState().setSunColor(hslToRgb(hsl.h, hsl.s, value))
				},
			},
		}),
	})

	// Terrain controls
	useControls('Terrain', {
		'Generation': folder({
			seed: {
				value: initialState.seed,
				min: 0,
				max: 10000,
				step: 1,
				onChange: (value) => useTerrainStore.getState().setSeed(value),
			},
			baseHeightScale: {
				value: initialState.baseHeightScale,
				min: 0,
				max: 20,
				step: 0.1,
				label: 'Height Scale',
				onChange: (value) => useTerrainStore.getState().setBaseHeightScale(value),
			},
			maxMountainHeight: {
				value: initialState.maxMountainHeight,
				min: 0,
				max: 1000,
				step: 10,
				label: 'Max Height',
				onChange: (value) => useTerrainStore.getState().setMaxMountainHeight(value),
			},
		}),
		'Noise': folder({
			continentScale: {
				value: initialState.continentScale,
				min: 0.00001,
				max: 0.001,
				step: 0.00001,
				label: 'Continent Scale',
				onChange: (value) => useTerrainStore.getState().setContinentScale(value),
			},
			noiseScale: {
				value: initialState.noiseScale,
				min: 0.001,
				max: 0.2,
				step: 0.001,
				label: 'Noise Scale',
				onChange: (value) => useTerrainStore.getState().setNoiseScale(value),
			},
			mountainScale: {
				value: initialState.mountainScale,
				min: 0.0001,
				max: 0.01,
				step: 0.0001,
				label: 'Mountain Scale',
				onChange: (value) => useTerrainStore.getState().setMountainScale(value),
			},
		}),
		'LOD': folder({
			splitFactor: {
				value: initialState.lodSplitFactor,
				min: 1,
				max: 4,
				step: 0.1,
				onChange: (value) => useTerrainStore.getState().setLodSplitFactor(value),
			},
			hysteresis: {
				value: initialState.lodHysteresis,
				min: 1,
				max: 2,
				step: 0.05,
				onChange: (value) => useTerrainStore.getState().setLodHysteresis(value),
			},
		}),
	})

	// Vegetation controls
	useControls('Vegetation', {
		enabled: {
			value: initialState.vegetationEnabled,
			onChange: (value) => useTerrainStore.getState().setVegetationEnabled(value),
		},
		density: {
			value: initialState.vegetationDensity,
			min: 0,
			max: 2,
			step: 0.1,
			onChange: (value) => useTerrainStore.getState().setVegetationDensity(value),
		},
	})

	// Water controls
	useControls('Water', {
		enabled: {
			value: initialState.waterEnabled,
			onChange: (value) => useTerrainStore.getState().setWaterEnabled(value),
		},
		level: {
			value: initialState.waterLevel,
			min: -50,
			max: 50,
			step: 1,
			onChange: (value) => useTerrainStore.getState().setWaterLevel(value),
		},
		'Appearance': folder({
			maxDepth: {
				value: initialState.waterMaxDepth,
				min: 10,
				max: 100,
				step: 1,
				label: 'Max Depth',
				onChange: (value) => useTerrainStore.getState().setWaterMaxDepth(value),
			},
			maxVisibleDepth: {
				value: initialState.waterMaxVisibleDepth,
				min: 1,
				max: 20,
				step: 0.5,
				label: 'Visible Depth',
				onChange: (value) => useTerrainStore.getState().setWaterMaxVisibleDepth(value),
			},
		}),
	})

	return null
}

export default TerrainControls

