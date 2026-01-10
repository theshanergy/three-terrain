import { Leva } from 'leva'

import Canvas from './scene/Canvas'
import TerrainControls from './TerrainControls'
import Notification from './ui/Notification'

export default function App() {
	return (
		<div className='App'>
			<Canvas />

			{/* Terrain configuration controls */}
			<TerrainControls />

			{/* Leva controls panel styling */}
			<Leva
				collapsed={false}
				flat={false}
				theme={{
					colors: {
						elevation1: '#1c1917',
						elevation2: '#292524',
						elevation3: '#44403c',
						accent1: '#22c55e',
						accent2: '#4ade80',
						accent3: '#86efac',
						highlight1: '#fafaf9',
						highlight2: '#e7e5e4',
						highlight3: '#d6d3d1',
					},
				}}
			/>

			<Notification />
		</div>
	)
}
