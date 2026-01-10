import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

import useTerrainStore from '../../../store/terrainStore'
import { useBiomeEnvironment } from '../../../hooks/useBiome'

// Sun directional light that follows camera target
const Sun = () => {
	const sunRef = useRef()
	const performanceDegraded = useTerrainStore((state) => state.performanceDegraded)
	const camera = useThree((state) => state.camera)

	// Get biome-specific environment config
	const { sunDirection, sunColor } = useBiomeEnvironment()

	useFrame(() => {
		const sun = sunRef.current

		if (!sun) return

		// Position sun based on sun direction relative to camera position
		const sunDistance = 50
		const targetPos = camera.position
		sun.position.set(targetPos.x + sunDirection.x * sunDistance, targetPos.y + sunDirection.y * sunDistance, targetPos.z + sunDirection.z * sunDistance)
		sun.target.position.set(targetPos.x, targetPos.y, targetPos.z)
		sun.target.updateMatrixWorld()
	})

	return (
		<directionalLight
			ref={sunRef}
			castShadow={!performanceDegraded}
			intensity={2.0}
			color={sunColor}
			shadow-mapSize={performanceDegraded ? [512, 512] : [1024, 1024]}
			shadow-camera-far={100}
			shadow-camera-left={-30}
			shadow-camera-right={30}
			shadow-camera-top={30}
			shadow-camera-bottom={-30}
			shadow-radius={2}
			shadow-normalBias={0.15}
		/>
	)
}

export default Sun
