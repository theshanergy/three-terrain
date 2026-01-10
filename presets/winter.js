/**
 * Winter Biome Preset
 *
 * A cold, snowy winter environment with snow-covered terrain,
 * sparse vegetation, and a crisp blue-white atmosphere.
 */

export const winterPreset = {
	name: 'Winter',
	description: 'Snow-covered terrain with cold, crisp atmosphere',

	// Environment
	sunDirection: [0.3, 0.25, 0.5],
	sunColor: [0.935, 0.956, 0.965],
	skyColorZenith: [0.3, 0.508, 0.7],
	skyColorHorizon: [0.896, 0.9296, 0.944],

	// Terrain
	seed: 9012,
	baseHeightScale: 4.5,
	continentScale: 0.00007,
	noiseScale: 0.035,
	mountainScale: 0.0008,
	maxMountainHeight: 500,
	spawnRadius: 200,
	spawnTransitionRadius: 2500,

	layers: [
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
			],

	// Vegetation (sparse in winter)
	vegetation: [],
	vegetationEnabled: false,
	vegetationDensity: 0.0,

	// Water (colder, clearer water)
	waterEnabled: true,
	waterLevel: 0,
	waterMaxDepth: 50,
	waterShorelineDepthThreshold: 2.5,
	waterShallowDepthThreshold: 20.0,
	waterMaxVisibleDepth: 12.0,
	waterEdgeFadeDistance: 0.1,
	waterColor: [0.0, 0.05, 0.15],
}

export default winterPreset
