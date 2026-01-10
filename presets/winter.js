/**
 * Winter Biome Preset
 *
 * A cold, snowy winter environment with snow-covered terrain,
 * sparse vegetation, and a crisp blue-white atmosphere.
 * This preset applies configuration to the terrain store.
 */

import { Color } from 'three'

// Helper to normalize a direction array
const normalizeDirection = (arr) => {
	const len = Math.sqrt(arr[0] * arr[0] + arr[1] * arr[1] + arr[2] * arr[2])
	return len > 0 ? [arr[0] / len, arr[1] / len, arr[2] / len] : [0, 1, 0]
}

// Helper to convert HSL to RGB array
const hslToRgb = (h, s, l) => {
	const color = new Color().setHSL(h, s, l)
	return [color.r, color.g, color.b]
}

export const winterPreset = {
	name: 'Winter',
	description: 'Snow-covered terrain with cold, crisp atmosphere',

	/**
	 * Apply winter preset to terrain store
	 * @param {Object} store - Zustand store instance
	 */
	apply: (store) => {
		// Set environment (using primitive arrays for performance)
		store.setSunDirection(normalizeDirection([0.3, 0.25, 0.5]))
		store.setSunColor(hslToRgb(0.55, 0.3, 0.95))
		store.setSkyColorZenith(hslToRgb(0.58, 0.4, 0.5))
		store.setSkyColorHorizon(hslToRgb(0.55, 0.3, 0.92))

		// Set terrain
		store.setSeed(9012)
		store.setBaseHeightScale(4.5)
		store.setContinentScale(0.00007)
		store.setNoiseScale(0.035)
		store.setMountainScale(0.0008)
		store.setMaxMountainHeight(500)
		store.setSpawnRadius(200)
		store.setSpawnTransitionRadius(2500)
		store.setLayers([
				{
					name: 'snow',
					textures: {
						albedo: '/assets/images/ground/snow.jpg',
						normal: '/assets/images/ground/snow_normal.jpg',
					},
					textureScale: 0.03,
					normalScale: 0.8,
					lod: {
						distance: 200,
						levels: 4,
						scaleFactor: 3.0,
					},
				},
				{
					name: 'dunes',
					textures: {
						albedo: '/assets/images/ground/snow.jpg',
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
					lod: {
						distance: 350,
						levels: 4,
						scaleFactor: 5,
					},
				},
			])

			// Set vegetation (sparse in winter)
		store.setVegetation([])
		store.setVegetationEnabled(false)
		store.setVegetationDensity(0.0)

		// Set water (colder, clearer water)
		store.setWaterEnabled(true)
		store.setWaterLevel(0)
		store.setWaterMaxDepth(50)
		store.setWaterShorelineDepthThreshold(2.5)
		store.setWaterShallowDepthThreshold(20.0)
		store.setWaterMaxVisibleDepth(12.0)
		store.setWaterEdgeFadeDistance(0.1)
		store.setWaterColor([0.0, 0.05, 0.15])
	},
}

export default winterPreset
