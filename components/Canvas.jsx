import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'

import useTerrainStore from '../store/terrainStore'
import { TerrainProvider } from '../context/TerrainContext'
import Environment from './Environment'
import Camera from './Camera'
import Loader from './Loader'

// Dev-only performance monitor - completely excluded from production bundle
const PerfMonitor = import.meta.env.DEV ? (await import('./PerformanceMonitor')).default : () => null

// Canvas component
const ThreeCanvas = () => {
	const performanceDegraded = useTerrainStore((state) => state.performanceDegraded)
	const setPerformanceDegraded = useTerrainStore((state) => state.setPerformanceDegraded)

	return (
		<div id='canvas' className='absolute inset-0 overflow-hidden pointer-events-none'>
			<Loader />

			<Canvas shadows={{ enabled: !performanceDegraded }} dpr={performanceDegraded ? 1 : [1, 1.5]} className='pointer-events-auto'>
				<PerformanceMonitor onDecline={() => setPerformanceDegraded(true)} />
				<PerfMonitor />

				<TerrainProvider>
					<Camera speed={50} sprintMultiplier={2} enabled={true} />

					<Suspense fallback={null}>
						<Environment />
					</Suspense>
				</TerrainProvider>
			</Canvas>
		</div>
	)
}

export default ThreeCanvas
