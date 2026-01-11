import useTerrainQuadtree from '../hooks/useTerrainQuadtree'
import useTerrainMaterial from '../hooks/useTerrainMaterial'
import useWaterMaterial from '../hooks/useWaterMaterial'
import TerrainTile from './TerrainTile'

// Main terrain component
const Terrain = () => {
	// Use quadtree LOD system
	const leafTiles = useTerrainQuadtree()

	// Create materials once and share across all tiles
	const terrainMaterial = useTerrainMaterial()
	const waterMaterial = useWaterMaterial()

	return (
		<group name='Terrain'>
			{leafTiles.map(({ node, edgeStitchInfo }) => (
				<TerrainTile key={node.key} node={node} edgeStitchInfo={edgeStitchInfo} terrainMaterial={terrainMaterial} waterMaterial={waterMaterial} />
			))}
		</group>
	)
}

export default Terrain
