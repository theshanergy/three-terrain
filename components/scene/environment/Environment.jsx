import { memo } from 'react'

import Sun from './Sun'
import Sky from './Sky'
import Terrain from './terrain/Terrain'

// Environment component
const SceneEnvironment = memo(() => {
	return (
		<>
			{/* Sun */}
			<Sun />

			{/* Sky */}
			<Sky />

			{/* Terrain */}
			<Terrain />
		</>
	)
})

export default SceneEnvironment
