import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'

import useTerrainStore from '../store/terrainStore'
import Environment from './Environment'
import Camera from './Camera'
import Loader from './Loader'

// Dev-only performance monitor - completely excluded from production bundle
const PerfMonitor = import.meta.env.DEV ? (await import('./PerformanceMonitor')).default : () => null

// Canvas component
const ThreeCanvas = () => {
	const performanceDegraded = useTerrainStore((state) => state.performanceDegraded)
	const setPerformanceDegraded = useTerrainStore((state) => state.setPerformanceDegraded)

	// Set default camera position
	const cameraConfig = useMemo(() => {
		return { position: [0, 50, 150], fov: 60, near: 0.1, far: 10000 }
	}, [])

	return (
		<div id='canvas' className='absolute inset-0 overflow-hidden pointer-events-none'>
			<Loader />

			<Canvas shadows={{ enabled: !performanceDegraded }} dpr={performanceDegraded ? 1 : [1, 1.5]} camera={cameraConfig} className='pointer-events-auto'>
				<PerformanceMonitor onDecline={() => setPerformanceDegraded(true)} />
				<PerfMonitor />
				
				<Camera speed={50} sprintMultiplier={2} enabled={true} />

				<Suspense fallback={null}>
					<Environment />
				</Suspense>
			</Canvas>
		</div>
	)
}

export default ThreeCanvas
