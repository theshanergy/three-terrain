import React from 'react'
import useTerrainStore from '../../store/terrainStore'
import useLoadingManager from '../../hooks/useLoadingManager'

export default function Loader() {
	const sceneLoaded = useTerrainStore((state) => state.sceneLoaded)

	// Use loading manager
	useLoadingManager()

	return (
		<>
			{!sceneLoaded && (
				<div className='absolute top-0 left-0 w-full h-full flex items-center justify-center z-10'>
					<div className='flex flex-col items-center'>
						<div
							className='w-[30px] h-[30px] relative animate-spin'
							style={{ animation: 'rotate 1.5s infinite linear', transformStyle: 'preserve-3d' }}
						>
							<div className='absolute w-full h-full bg-green-500' style={{ transform: 'translateZ(15px)' }}></div>
							<div className='absolute w-full h-full bg-green-500' style={{ transform: 'translateZ(-15px)' }}></div>
							<div className='absolute w-full h-full bg-green-600' style={{ transform: 'translateX(-15px) rotateY(90deg)' }}></div>
							<div className='absolute w-full h-full bg-green-700' style={{ transform: 'translateX(15px) rotateY(90deg)' }}></div>
							<div className='absolute w-full h-full bg-green-400' style={{ transform: 'translateY(-15px) rotateX(90deg)' }}></div>
							<div className='absolute w-full h-full bg-green-800' style={{ transform: 'translateY(15px) rotateX(90deg)' }}></div>
						</div>
						<div className='text-green-500 mt-4 text-center'>
							<h3 className='text-lg font-semibold'>Loading Terrain</h3>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
