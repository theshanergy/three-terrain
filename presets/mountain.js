/**
 * Mountain Biome Preset
 *
 * A cold, rugged environment with high elevations and sparse vegetation.
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

export const mountainPreset = {
	name: 'Mountain',
	description: 'A cold, rugged environment with high elevations and sparse vegetation.',

	/**
	 * Apply mountain preset to terrain store
	 * @param {Object} store - Zustand store instance
	 */
	apply: (store) => {
		// Set environment (using primitive arrays for performance)
		store.setSunDirection(normalizeDirection([0.545, 0.365, 0.4]))
		store.setSunColor(hslToRgb(0.1, 1.0, 0.93))
		store.setSkyColorZenith(hslToRgb(0.58, 0.57, 0.59))
		store.setSkyColorHorizon(hslToRgb(0.58, 0.67, 0.85))

		// Set terrain
		store.setSeed(5678)
		store.setBaseHeightScale(6)
		store.setContinentScale(0.00007)
		store.setNoiseScale(0.06)
		store.setMountainScale(0.001)
		store.setMaxMountainHeight(600)
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
					name: 'grass',
					textures: {
						albedo: '/assets/images/ground/wispy-grass-meadow_albedo.jpg',
						normal: '/assets/images/ground/wispy-grass-meadow_normal.jpg',
					},
					textureScale: 0.2,
					normalScale: 1.0,
					height: {
						min: -1,
						transitionMin: 1.0,
						influence: 1.0,
					},
					slope: {
						max: 0.03,
						influence: 0.6,
						transition: 0.02,
					},
					lod: {
						distance: 100,
						levels: 3,
						scaleFactor: 3,
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
						min: 300,
						transitionMin: 80.0,
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
				meshFactory: () => createGrassMesh({ colorHex: '#3f4722' }),
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
				density: 100000,
				maxLod: 1,
				collider: null,
			},
			{
				name: 'pine_large',
				model: '/assets/models/environment/pine_trees.glb',
				meshes: {
					lod0: 'SM_Pine01',
					lod1: 'SM_Pine01_lod1',
					lod2: 'SM_Pine01_lod2',
					lod3: 'SM_Pine01_lod3',
				},
				collider: {
					width: 0.4,
					height: 10.0,
					type: 'cylinder',
				},
				sphericalNormals: {
					lod3: true,
				},
				maxLod: 3,
				distance: {
					min: 0,
					max: 600,
				},
				scale: {
					min: 1.2,
					max: 2.2,
				},
				slope: {
					min: 0,
					max: 0.003,
				},
				height: {
					min: 15,
					max: 180,
				},
				density: 150,
			},
			{
				name: 'pine_large_02',
				model: '/assets/models/environment/pine_trees.glb',
				meshes: {
					lod0: 'SM_Pine02',
					lod1: 'SM_Pine02_lod1',
					lod2: 'SM_Pine02_lod2',
					lod3: 'SM_Pine02_lod3',
				},
				collider: {
					width: 0.4,
					height: 10.0,
					type: 'cylinder',
				},
				sphericalNormals: {
					lod3: true,
				},
				maxLod: 3,
				distance: {
					min: 0,
					max: 600,
				},
				scale: {
					min: 1.2,
					max: 2.2,
				},
				slope: {
					min: 0,
					max: 0.003,
				},
				height: {
					min: 15,
					max: 150,
				},
				density: 150,
			},
			{
				name: 'pine_dead',
				model: '/assets/models/environment/pine_trees.glb',
				meshes: {
					lod0: 'SM_PineDead01',
					lod1: 'SM_PineDead01_lod1',
					lod2: 'SM_PineDead01_lod2',
					lod3: 'SM_PineDead01_lod3',
				},
				collider: {
					width: 0.3,
					height: 8.0,
					type: 'cylinder',
				},
				sphericalNormals: {
					lod3: true,
				},
				maxLod: 3,
				distance: {
					min: 0,
					max: 500,
				},
				scale: {
					min: 1.0,
					max: 1.8,
				},
				slope: {
					min: 0,
					max: 0.003,
				},
				height: {
					min: 25,
					max: 170,
				},
				density: 60,
			},
			{
				name: 'pine_medium',
				model: '/assets/models/environment/pine_trees.glb',
				meshes: {
					lod0: 'SM_PineMedium01',
					lod1: 'SM_PineMedium01_lod1',
					lod2: 'SM_PineMedium01_lod2',
					lod3: 'SM_PineMedium01_lod3',
				},
				collider: {
					width: 0.4,
					height: 9.0,
					type: 'cylinder',
				},
				sphericalNormals: {
					lod3: true,
				},
				maxLod: 3,
				distance: {
					min: 0,
					max: 550,
				},
				scale: {
					min: 1.0,
					max: 1.5,
				},
				slope: {
					min: 0,
					max: 0.004,
				},
				height: {
					min: 10,
					max: 180,
				},
				density: 80,
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

export default mountainPreset
