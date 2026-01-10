import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Vector3 } from 'three'
import { getTerrainHelpers } from '../utils/terrain/heightSampler'

const KEY_MAP = {
	KeyW: 'forward',
	KeyS: 'backward',
	KeyA: 'left',
	KeyD: 'right',
	KeyE: 'up',
	KeyQ: 'down',
	ShiftLeft: 'sprint',
	ShiftRight: 'sprint',
}

const Camera = ({ speed = 500, sprintMultiplier = 2, enabled = true }) => {
	const controlsRef = useRef()
	const velocity = useRef(new Vector3())
	const direction = useRef(new Vector3())
	const moveState = useRef({
		forward: false,
		backward: false,
		left: false,
		right: false,
		up: false,
		down: false,
		sprint: false,
	})

	// Handle keyboard input
	useEffect(() => {
		if (!enabled) return

		const handleKeyDown = (event) => {
			const action = KEY_MAP[event.code]
			if (action) {
				moveState.current[action] = true
			}
		}

		const handleKeyUp = (event) => {
			const action = KEY_MAP[event.code]
			if (action) {
				moveState.current[action] = false
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		document.addEventListener('keyup', handleKeyUp)

		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.removeEventListener('keyup', handleKeyUp)
		}
	}, [enabled])

	// Handle movement
	useFrame((state, delta) => {
		if (!enabled || !controlsRef.current?.isLocked) return

		const { camera } = state
		const actualSpeed = speed * (moveState.current.sprint ? sprintMultiplier : 1)

		// Get camera direction
		camera.getWorldDirection(direction.current)

		// Calculate right vector
		const right = new Vector3()
		right.crossVectors(camera.up, direction.current).normalize()

		// Reset velocity
		velocity.current.set(0, 0, 0)

		// Forward/Backward
		if (moveState.current.forward) {
			velocity.current.add(direction.current)
		}
		if (moveState.current.backward) {
			velocity.current.sub(direction.current)
		}

		// Left/Right
		if (moveState.current.left) {
			velocity.current.add(right)
		}
		if (moveState.current.right) {
			velocity.current.sub(right)
		}

		// Up/Down
		if (moveState.current.up) {
			velocity.current.y += 1
		}
		if (moveState.current.down) {
			velocity.current.y -= 1
		}

		// Normalize and apply speed
		if (velocity.current.length() > 0) {
			velocity.current.normalize().multiplyScalar(actualSpeed * delta)
			camera.position.add(velocity.current)
		}

		// Apply elevation bounds to prevent clipping under terrain or flying too high
		const terrainHelpers = getTerrainHelpers()
		if (terrainHelpers) {
			const getTerrainHeight = terrainHelpers.getWorldHeight
			const terrainHeight = getTerrainHeight(camera.position.x, camera.position.z)

			// Keep camera at least 2 units above terrain
			const minHeight = terrainHeight + 2.0
			if (camera.position.y < minHeight) {
				camera.position.y = minHeight
			}

			// Prevent flying higher than 500 units above terrain
			const maxHeight = terrainHeight + 500
			if (camera.position.y > maxHeight) {
				camera.position.y = maxHeight
			}
		} else {
			// Fallback: ensure camera stays above minimum absolute height if terrain not ready
			const minAbsoluteHeight = 1.0
			if (camera.position.y < minAbsoluteHeight) {
				camera.position.y = minAbsoluteHeight
			}
		}
	})

	// Show instructions when controls are locked
	useEffect(() => {
		if (!enabled) return

		const handleLock = () => {
			console.log('Camera controls locked. WASD to move, E/Q for up/down, Shift to sprint, ESC to unlock')
		}

		const handleUnlock = () => {
			console.log('Camera controls unlocked. Click to re-enable')
		}

		const controls = controlsRef.current
		if (controls) {
			controls.addEventListener('lock', handleLock)
			controls.addEventListener('unlock', handleUnlock)

			return () => {
				controls.removeEventListener('lock', handleLock)
				controls.removeEventListener('unlock', handleUnlock)
			}
		}
	}, [enabled])

	if (!enabled) return null

	return <PointerLockControls ref={controlsRef} selector='#canvas canvas' />
}

export default Camera
