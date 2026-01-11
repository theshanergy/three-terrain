/**
 * Mountain Biome Preset
 *
 * A cold, rugged environment with high elevations and sparse vegetation.
 */

import { createGrassMesh } from '../utils/vegetation/grassMesh'

export const mountainPreset = {
	name: 'Mountain',
	description: 'A cold, rugged environment with high elevations and sparse vegetation.',

	// Environment
	sunDirection: [0.545, 0.365, 0.4],
	sunColor: [1.0, 0.944, 0.86],
	skyColorZenith: [0.3563, 0.5993, 0.8237],
	skyColorHorizon: [0.7495, 0.854, 0.9505],

	// Terrain
	seed: 5678,
	baseHeightScale: 6,
	continentScale: 0.00007,
	noiseScale: 0.06,
	mountainScale: 0.001,
	maxMountainHeight: 600,
	spawnRadius: 200,
	spawnTransitionRadius: 2500,

	layers: [
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
			],

	// Vegetation
	vegetation: [
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
		],
	vegetationEnabled: true,
	vegetationDensity: 1.0,

	// Water
	waterLevel: 0,
	waterMaxDepth: 50,
	waterShorelineDepthThreshold: 2.5,
	waterShallowDepthThreshold: 20.0,
	waterMaxVisibleDepth: 8.0,
	waterEdgeFadeDistance: 0.1,
	waterColor: [0.0, 0.12, 0.06],
}

export default mountainPreset
