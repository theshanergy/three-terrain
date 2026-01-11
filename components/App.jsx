import { Leva } from 'leva'

import Canvas from './Canvas'
import GUI from './GUI'
import Notification from './Notification'

export default function App() {
	return (
		<div className='App'>
			<Canvas />
			{/* Terrain configuration controls */}
			<GUI />
			{/* Leva controls panel styling */}
			<Leva
				collapsed={false}
				flat={false}
				titleBar={{ title: 'Controls', position: { x: 0, y: 0 } }}
				fill={false}
				hideCopyButton={false}
				theme={{
					sizes: {
						rootWidth: '320px',
						controlWidth: '160px',
					},
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
