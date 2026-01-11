// Core heightmap generation
// Creates a height sampling function from terrain configuration

import { createSeededNoise } from './noise'

/**
 * Smoothstep interpolation (cubic hermite)
 */
const smoothstep = (t) => {
	const c = Math.max(0, Math.min(1, t))
	return c * c * (3 - 2 * c)
}

/**
 * Create a height sampling function from terrain configuration.
 *
 * The returned function samples normalized height (-1 to +1 range) at any world position.
 * Uses a unified noise approach - one coherent function produces all terrain features:
 * continents, mountains, valleys - without separate "feature" systems.
 *
 * @param {Object} config - Terrain configuration
 * @param {number} config.seed - Random seed for noise generation
 * @param {number} config.baseHeightScale - Scale multiplier for world heights
 * @param {number} config.continentScale - Scale for continental landmass noise
 * @param {number} config.noiseScale - Scale for base terrain variation
 * @param {number} config.mountainScale - Scale for mountain ridge noise
 * @param {number} config.maxMountainHeight - Maximum mountain height in world units
 * @param {number} config.spawnRadius - Radius of flat spawn area
 * @param {number} config.spawnTransitionRadius - Outer radius of spawn transition zone
 * @param {number} config.waterLevel - Water surface level in world units
 * @param {number} config.waterMaxDepth - Maximum water depth in world units
 * @returns {Function} Height sampling function: (x, z) => normalizedHeight
 */
export function createHeightSampler(config) {
	const { seed, baseHeightScale, continentScale, noiseScale, mountainScale, maxMountainHeight, spawnRadius, spawnTransitionRadius, waterLevel, waterMaxDepth } = config

	const noise = createSeededNoise(seed)

	const spawnRadiusSq = spawnRadius * spawnRadius
	const transitionEndSq = spawnTransitionRadius * spawnTransitionRadius

	/**
	 * Sample normalized height at a world position.
	 *
	 * @param {number} x - World X coordinate
	 * @param {number} z - World Z coordinate
	 * @returns {number} Normalized height value (roughly -1 to +1, can exceed for mountains)
	 */
	return function sampleHeight(x, z) {
		const distSq = x * x + z * z

		// === SPAWN AREA: Flat spawn zone (check first for early return) ===
		if (distSq < spawnRadiusSq) {
			return 0
		}

		const dist = Math.sqrt(distSq)

		// === LAYER 1: Continental shape (very large scale) ===
		// Domain warp for organic coastlines
		const warpX = noise.perlin2(x * continentScale * 0.7 + 50, z * continentScale * 0.7 + 50) * 800
		const warpZ = noise.perlin2(x * continentScale * 0.7 + 150, z * continentScale * 0.7 + 150) * 800
		const wx = x + warpX
		const wz = z + warpZ

		// Continental noise - this is the primary driver of elevation
		// Ranges roughly -1 to 1, centered around 0
		let continental = noise.perlin2(wx * continentScale, wz * continentScale) * 0.7 + noise.perlin2(wx * continentScale * 2.5, wz * continentScale * 2.5) * 0.3

		// Bias terrain upward to reduce lake coverage (shift from ~50% water to ~20% water)
		continental += 0.1

		// Spawn area land guarantee - ensure spawn zone is always on land
		if (dist < spawnRadius) {
			continental = Math.max(continental, 0.3)
		}

		// Vary shoreline sharpness along the coast using continental noise
		// This creates organic variation - some areas have sharp cliffs, others gentle slopes
		// Remap noise (-1 to 1) to safe sharpness range (0.5 to 4.0)
		// Lower values = gentler slopes, higher values = sharper cliffs
		const shorelineVariation = noise.perlin2(x * continentScale * 0.4 + 500, z * continentScale * 0.4 + 500)
		const shorelineSharpness = 2.25 + shorelineVariation * 1.75 // Range: 0.5 to 4.0
		continental = Math.sign(continental) * Math.pow(Math.abs(continental), 1.0 / shorelineSharpness)

		// === LAYER 2: Base terrain variation ===
		const baseNoise =
			noise.perlin2(x * noiseScale, z * noiseScale) * 0.6 +
			noise.perlin2(x * noiseScale * 2.2, z * noiseScale * 2.2) * 0.3 +
			noise.perlin2(x * noiseScale * 4.5, z * noiseScale * 4.5) * 0.1

		// === LAYER 3: Mountains (only where continental is high) ===
		const inlandFactor = smoothstep(continental / 0.6)

		const ridge1 = 1 - Math.abs(noise.perlin2(x * mountainScale, z * mountainScale))
		const ridge2 = 1 - Math.abs(noise.perlin2(x * mountainScale * 1.8 + 100, z * mountainScale * 1.8 + 100))
		const ridgeNoise = ridge1 * ridge1 * 0.6 + ridge2 * ridge2 * 0.4

		const mountainMask = noise.perlin2(x * mountainScale * 0.3 + 500, z * mountainScale * 0.3 + 500)
		const mountainFactor = smoothstep((mountainMask + 0.3) / 0.8) * inlandFactor

		const mountainHeight = ridgeNoise * mountainFactor * (maxMountainHeight / baseHeightScale)

		// === COMBINE: Continental drives overall elevation ===
		// Continental value directly sets base elevation (can go negative for lakes)
		// Only add base noise variation when we're safely above water (prevents tiny lakes)
		// Base noise adds rolling hills on land, mountains add peaks on high ground
		// Continental multiplier calculated from desired max depth:
		// maxDepth (in world units) / baseHeightScale gives normalized depth needed
		const continentalMultiplier = (waterMaxDepth + Math.abs(waterLevel)) / baseHeightScale
		const baseHeight = continental * continentalMultiplier
		let height = baseHeight

		// Only apply fine-grained terrain variation well above water level
		// Use a smooth fade so terrain doesn't suddenly become flat near water
		// Water level (scaled by baseHeightScale) determines normalized water threshold
		// We want base terrain to be at least 0.2 above water before adding variation
		const waterThreshold = waterLevel / baseHeightScale
		const safetyMargin = 0.5 // Extra margin to prevent noise from creating tiny lakes
		const minSafeHeight = waterThreshold + safetyMargin // -0.25 + 0.5 = 0.25

		if (baseHeight > minSafeHeight) {
			// Safely above water - apply full noise variation
			height += baseNoise * 0.5
		} else if (baseHeight > waterThreshold) {
			// Near water - fade out noise to prevent creating tiny lakes
			const fadeFactor = (baseHeight - waterThreshold) / safetyMargin
			height += Math.max(0, baseNoise) * 0.5 * fadeFactor // Only additive noise near water
		}

		// Below water threshold: no noise, lakes stay smooth
		height += mountainHeight

		// === SPAWN AREA: Smooth transition from flat spawn to natural terrain ===
		if (distSq < transitionEndSq) {
			const t = (dist - spawnRadius) / (spawnTransitionRadius - spawnRadius)
			const blend = t * t * t * (t * (t * 6 - 15) + 10) // Quintic smoothstep
			height *= blend // Blend from 0 (flat) to full terrain height
		}

		// Guard against NaN from noise functions at extreme coordinates
		// (noisejs can return NaN when floating point precision is lost)
		if (!Number.isFinite(height)) {
			return 0
		}

		return height
	}
}
