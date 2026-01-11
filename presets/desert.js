/**
 * Desert Biome Preset
 *
 * A hot, arid environment with sandy terrain and minimal vegetation.
 */

import { createGrassMesh } from '../utils/vegetation/grassMesh'

export const desertPreset = {
	name: 'Desert',
	description: 'A hot, arid environment with sandy terrain and minimal vegetation.',

	// Environment
	sunDirection: [0.545, 0.365, 0.4],
	sunColor: [1.0, 0.944, 0.86],
	skyColorZenith: [0.3563, 0.5993, 0.8237],
	skyColorHorizon: [0.7495, 0.854, 0.9505],

	// Terrain
	seed: 1234,
	baseHeightScale: 4,
	continentScale: 0.00007,
	noiseScale: 0.04,
	mountainScale: 0.001,
	maxMountainHeight: 400,
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
	],

	// Vegetation
	vegetation: [
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
	],
	vegetationEnabled: true,
	vegetationDensity: 1.0,

	// Water
	waterLevel: 0,
	waterMaxDepth: 50,
	waterShorelineDepthThreshold: 2.5,
	waterShallowDepthThreshold: 20.0,
	waterMaxVisibleDepth: 8.0,
	waterEdgeFadeDistance: 0.25,
	waterColor: [0.0, 0.12, 0.06],
}

export default desertPreset
