// Terrain Context
// Provides reactive terrain data to the component tree

import { createContext, useContext, useMemo, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

import useTerrainStore from '../store/terrainStore'
import { createHeightSampler } from '../utils/terrain/heightmap'
import { createTerrainQueries } from '../utils/terrain/terrainQueries'

const TerrainContext = createContext(null)

/**
 * Select only the store values that affect terrain generation.
 * When any of these change, the heightmap needs to be recreated.
 */
const selectTerrainConfig = (state) => ({
	seed: state.seed,
	baseHeightScale: state.baseHeightScale,
	continentScale: state.continentScale,
	noiseScale: state.noiseScale,
	mountainScale: state.mountainScale,
	maxMountainHeight: state.maxMountainHeight,
	spawnRadius: state.spawnRadius,
	spawnTransitionRadius: state.spawnTransitionRadius,
	waterLevel: state.waterLevel,
	waterMaxDepth: state.waterMaxDepth,
})

/**
 * Terrain provider component.
 *
 * Subscribes to terrain-affecting store values and recreates the
 * heightmap sampler when they change. All children receive reactive
 * access to terrain data via useTerrainContext().
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function TerrainProvider({ children }) {
	const config = useTerrainStore(useShallow(selectTerrainConfig))

	// Create terrain API when config changes
	const terrain = useMemo(() => {
		const sampleHeight = createHeightSampler(config)
		return createTerrainQueries(sampleHeight, config)
	}, [config])

	// Stable ref for imperative code (useFrame, physics, etc.)
	// This always points to the current terrain API
	const terrainRef = useRef(terrain)
	terrainRef.current = terrain

	// Provide both the reactive API and a stable ref
	const value = useMemo(
		() => ({
			...terrain,
			ref: terrainRef,
		}),
		[terrain]
	)

	return <TerrainContext.Provider value={value}>{children}</TerrainContext.Provider>
}

/**
 * Hook to access terrain data from context.
 *
 * Returns terrain query functions that update reactively when
 * terrain configuration changes.
 *
 * @returns {Object} Terrain API with sampleHeight, getHeight, getNormal, isWater, baseHeightScale, ref
 * @throws {Error} If used outside of TerrainProvider
 */
export function useTerrainContext() {
	const context = useContext(TerrainContext)
	if (!context) {
		throw new Error('useTerrainContext must be used within a TerrainProvider')
	}
	return context
}
