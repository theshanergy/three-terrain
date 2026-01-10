import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Color } from 'three'

import useTerrainStore from '../store/terrainStore'

// Sun directional light that follows camera target
const Sun = () => {
	const sunRef = useRef()
	const performanceDegraded = useTerrainStore((state) => state.performanceDegraded)
	const camera = useThree((state) => state.camera)

	// Create a stable Color object for the light
	const sunColorObj = useMemo(() => new Color(), [])

	useFrame(() => {
		const sun = sunRef.current
		if (!sun) return

		// Get current values from store (doesn't trigger rerenders)
		const { sunDirection, sunColor } = useTerrainStore.getState()

		// Update sun color
		sunColorObj.setRGB(sunColor[0], sunColor[1], sunColor[2])
		sun.color.copy(sunColorObj)

		// Position sun based on sun direction relative to camera position
		const sunDistance = 50
		const targetPos = camera.position
		sun.position.set(
			targetPos.x + sunDirection[0] * sunDistance,
			targetPos.y + sunDirection[1] * sunDistance,
			targetPos.z + sunDirection[2] * sunDistance
		)
		sun.target.position.set(targetPos.x, targetPos.y, targetPos.z)
		sun.target.updateMatrixWorld()
	})

	return (
		<directionalLight
			ref={sunRef}
			castShadow={!performanceDegraded}
			intensity={2.0}
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
