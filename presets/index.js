/**
 * Biome Presets System
 * 
 * Biome presets apply complete configurations to the terrain store using individual setters.
 * Each preset has an apply() function that sets individual state properties in the terrain store.
 * 
 * ## State Architecture:
 * 
 * State is now flattened for improved performance:
 * - Direct property access (e.g., `store.sunDirection` instead of `store.environment.sunDirection`)
 * - Individual setters for each property (e.g., `setSunDirection()`, `setSeed()`)
 * - Components can subscribe to specific properties to minimize re-renders
 * 
 * ### Usage:
 * ```javascript
 * import { applyBiomePreset } from './presets'
 * import useTerrainStore from './store/terrainStore'
 * 
 * // Apply a preset
 * const store = useTerrainStore.getState()
 * applyBiomePreset('mountain', store)
 * 
 * // Or modify individual values
 * store.setSeed(9999)
 * store.setSunDirection([1, 1, 0]) // Will be normalized
 * ```
 */

import desertPreset from './desert'
import mountainPreset from './mountain'
import winterPreset from './winter'

export const BIOME_PRESETS = {
	desert: desertPreset,
	mountain: mountainPreset,
	winter: winterPreset,
}

export const DEFAULT_BIOME_PRESET = 'desert'

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
 * Apply a biome preset to the terrain store
 * @param {string} presetName - Name of the preset to apply
 * @param {Object} store - Zustand store instance
 */
export function applyBiomePreset(presetName, store) {
	const preset = BIOME_PRESETS[presetName]
	
	if (!preset) {
		console.warn(`Biome preset "${presetName}" not found, using default`)
		BIOME_PRESETS[DEFAULT_BIOME_PRESET].apply(store)
		return
	}
	
	preset.apply(store)
}

export { desertPreset, mountainPreset, winterPreset }
