// Terrain query functions
// Derived queries that use the heightmap sampler

import { Vector3 } from 'three'

// Epsilon for numerical gradient approximation
const GRADIENT_EPSILON = 0.01

/**
 * Create terrain query functions from a height sampler.
 *
 * These are convenience functions that derive information from the base height sampler:
 * - getHeight: world-space height
 * - getNormal: surface normal via finite differences
 * - isWater: whether a point is below water level
 *
 * @param {Function} sampleHeight - Height sampling function: (x, z) => normalizedHeight
 * @param {Object} config - Configuration with baseHeightScale and waterLevel
 * @param {number} config.baseHeightScale - Scale multiplier for world heights
 * @param {number} config.waterLevel - Water surface level in world units
 * @returns {Object} Query functions { sampleHeight, getHeight, getNormal, isWater, baseHeightScale }
 */
export function createTerrainQueries(sampleHeight, config) {
	const { baseHeightScale, waterLevel } = config

	/**
	 * Get terrain height in world units.
	 *
	 * @param {number} x - World X coordinate
	 * @param {number} z - World Z coordinate
	 * @returns {number} Height in world units
	 */
	function getHeight(x, z) {
		return sampleHeight(x, z) * baseHeightScale
	}

	/**
	 * Get terrain normal using numerical gradient (finite differences).
	 *
	 * @param {number} x - World X coordinate
	 * @param {number} z - World Z coordinate
	 * @param {Vector3} [target] - Optional target vector to store result
	 * @returns {Vector3} Normalized surface normal
	 */
	function getNormal(x, z, target = new Vector3()) {
		const dist = Math.sqrt(x * x + z * z)
		const epsilon = dist > 500 ? GRADIENT_EPSILON * 4 : GRADIENT_EPSILON

		const hL = getHeight(x - epsilon, z)
		const hR = getHeight(x + epsilon, z)
		const hD = getHeight(x, z - epsilon)
		const hU = getHeight(x, z + epsilon)

		const dhdx = (hR - hL) / (2 * epsilon)
		const dhdz = (hU - hD) / (2 * epsilon)

		return target.set(-dhdx, 1, -dhdz).normalize()
	}

	/**
	 * Check if a position is in water (terrain below water level).
	 *
	 * @param {number} x - World X coordinate
	 * @param {number} z - World Z coordinate
	 * @returns {boolean} True if position is underwater
	 */
	function isWater(x, z) {
		return getHeight(x, z) < waterLevel
	}

	return {
		sampleHeight,
		getHeight,
		getNormal,
		isWater,
		baseHeightScale,
	}
}
