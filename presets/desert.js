/**
 * Desert Biome Preset
 *
 * A hot, arid environment with sandy terrain and minimal vegetation.
 * This preset applies configuration to the terrain store.
 */

import { Color } from 'three'
import { createGrassMesh } from '../utils/vegetation/grassMesh'

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

export const desertPreset = {
	name: 'Desert',
	description: 'A hot, arid environment with sandy terrain and minimal vegetation.',

	/**
	 * Apply desert preset to terrain store
	 * @param {Object} store - Zustand store instance
	 */
	apply: (store) => {
		// Set environment (using primitive arrays for performance)
		store.setSunDirection(normalizeDirection([0.545, 0.365, 0.4]))
		store.setSunColor(hslToRgb(0.1, 1.0, 0.93))
		store.setSkyColorZenith(hslToRgb(0.58, 0.57, 0.59))
		store.setSkyColorHorizon(hslToRgb(0.58, 0.67, 0.85))

		// Set terrain
		store.setSeed(1234)
		store.setBaseHeightScale(4)
		store.setContinentScale(0.00007)
		store.setNoiseScale(0.04)
		store.setMountainScale(0.001)
		store.setMaxMountainHeight(400)
		store.setSpawnRadius(200)
		store.setSpawnTransitionRadius(2500)
		store.setLayers([
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
			])

			// Set vegetation
		store.setVegetation([
			{
				name: 'grass',
				meshFactory: createGrassMesh,
				distance: {
					min: 1,
					max: 100,
				},
				scale: {
					min: 1.0,
					max: 1.2,
				},
				slope: {
					min: 0.0,
					max: 0.5,
				},
				height: {
					min: -1,
					max: 100,
				},
				density: 5000,
				maxLod: 1,
				collider: null,
			},
		])
		store.setVegetationEnabled(true)
		store.setVegetationDensity(1.0)

		// Set water
		store.setWaterEnabled(true)
		store.setWaterLevel(0)
		store.setWaterMaxDepth(50)
		store.setWaterShorelineDepthThreshold(2.5)
		store.setWaterShallowDepthThreshold(20.0)
		store.setWaterMaxVisibleDepth(8.0)
		store.setWaterEdgeFadeDistance(0.1)
		store.setWaterColor([0.0, 0.12, 0.06])
	},
}

export default desertPreset
