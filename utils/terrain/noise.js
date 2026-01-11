// Seeded noise factory
// Creates a deterministic noise generator from a seed value

import { Noise } from 'noisejs'

/**
 * Create a seeded noise generator.
 *
 * @param {number} seed - Seed value for deterministic noise
 * @returns {Noise} Noise instance with perlin2/perlin3 methods
 */
export function createSeededNoise(seed) {
	return new Noise(seed)
}
