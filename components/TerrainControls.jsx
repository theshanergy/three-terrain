import { useControls, folder, button } from 'leva'
import useTerrainStore from '../store/terrainStore'
import { getBiomeList } from '../config/biomes'

/**
 * TerrainControls - Leva UI panel for runtime terrain configuration
 * Exposes biome selection and terrain generation parameters for real-time tweaking
 */
const TerrainControls = () => {
	const currentBiome = useTerrainStore((state) => state.currentBiome)
	const setBiome = useTerrainStore((state) => state.setBiome)
	const terrainConfig = useTerrainStore((state) => state.terrainConfig)
	const setTerrainConfig = useTerrainStore((state) => state.setTerrainConfig)

	// Get available biomes for dropdown
	const biomeList = getBiomeList()
	const biomeOptions = biomeList.reduce((acc, biome) => {
		acc[biome.name] = biome.id
		return acc
	}, {})

	// Biome selection control
	useControls('Biome', {
		biome: {
			value: currentBiome,
			options: biomeOptions,
			onChange: (value) => setBiome(value),
		},
	})

	// LOD controls
	useControls('LOD Settings', {
		splitFactor: {
			value: terrainConfig.lodSplitFactor,
			min: 1,
			max: 4,
			step: 0.1,
			onChange: (value) => setTerrainConfig({ lodSplitFactor: value }),
		},
		hysteresis: {
			value: terrainConfig.lodHysteresis,
			min: 1,
			max: 2,
			step: 0.05,
			onChange: (value) => setTerrainConfig({ lodHysteresis: value }),
		},
	})

	// Vegetation controls
	useControls('Vegetation', {
		enabled: {
			value: terrainConfig.vegetationEnabled,
			onChange: (value) => setTerrainConfig({ vegetationEnabled: value }),
		},
		density: {
			value: terrainConfig.vegetationDensity,
			min: 0,
			max: 2,
			step: 0.1,
			onChange: (value) => setTerrainConfig({ vegetationDensity: value }),
		},
	})

	// Water controls
	useControls('Water', {
		enabled: {
			value: terrainConfig.waterEnabled,
			onChange: (value) => setTerrainConfig({ waterEnabled: value }),
		},
		level: {
			value: terrainConfig.waterLevel,
			min: -50,
			max: 50,
			step: 1,
			onChange: (value) => setTerrainConfig({ waterLevel: value }),
		},
	})

	return null
}

export default TerrainControls
