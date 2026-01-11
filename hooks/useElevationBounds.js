import { useCallback } from 'react'

import { useTerrainContext } from '../context/TerrainContext'

/**
 * Custom hook for elevation constraints using direct terrain height sampling.
 * Handles both lower bounds (ground avoidance) and optional upper bounds (ceiling limits).
 *
 * @param {Object} positionRef - Ref to position object with x, y, z
 * @param {number} minHeightAboveTerrain - Minimum distance above terrain (ground clearance)
 * @param {number|null} maxHeightAboveTerrain - Optional maximum distance above terrain (ceiling limit)
 * @param {Object|null} targetRef - Optional target ref for midpoint sampling (prevents clipping over hills)
 * @param {Object|null} velocityRef - Optional velocity ref to zero vertical velocity when hitting bounds
 * @returns {Function} Function to check and enforce elevation bounds
 */
const useElevationBounds = (positionRef, minHeightAboveTerrain, maxHeightAboveTerrain = null, targetRef = null, velocityRef = null) => {
	// Get terrain context - use the ref for non-reactive access in callbacks
	const { ref: terrainRef } = useTerrainContext()

	const checkElevationBounds = useCallback(() => {
		// Use ref.current to get latest terrain without causing re-renders
		const terrain = terrainRef.current

		// Use direct terrain height sampling if available (much faster than raycasting)
		if (terrain) {
			const terrainHeight = terrain.getHeight(positionRef.current.x, positionRef.current.z)

			// Lower bound (ground avoidance)
			const minAllowedHeight = terrainHeight + minHeightAboveTerrain
			if (positionRef.current.y < minAllowedHeight) {
				positionRef.current.y = minAllowedHeight
				// Zero downward velocity if provided
				if (velocityRef && velocityRef.current.y < 0) {
					velocityRef.current.y = 0
				}
			}

			// Upper bound (ceiling limit) - optional
			if (maxHeightAboveTerrain !== null) {
				const maxAllowedHeight = terrainHeight + maxHeightAboveTerrain
				if (positionRef.current.y > maxAllowedHeight) {
					positionRef.current.y = maxAllowedHeight
					// Zero upward velocity if provided
					if (velocityRef && velocityRef.current.y > 0) {
						velocityRef.current.y = 0
					}
				}
			}

			// Sample an additional point between position and target to prevent clipping over hills
			if (targetRef) {
				const midX = (positionRef.current.x + targetRef.current.x) / 2
				const midZ = (positionRef.current.z + targetRef.current.z) / 2
				const midTerrainHeight = terrain.getHeight(midX, midZ)
				const midRequiredHeight = midTerrainHeight + minHeightAboveTerrain

				// If the interpolated midpoint would be below ground, raise the position
				const midY = (positionRef.current.y + targetRef.current.y) / 2
				if (midY < midRequiredHeight) {
					// Raise position to ensure the midpoint clears the terrain
					const heightDeficit = midRequiredHeight - midY
					positionRef.current.y += heightDeficit
				}
			}
		} else {
			// Fallback: ensure position stays above minimum absolute height if terrain not ready
			const minAbsoluteHeight = 1.0
			if (positionRef.current.y < minAbsoluteHeight) {
				positionRef.current.y = minAbsoluteHeight
			}
		}
	}, [terrainRef, minHeightAboveTerrain, maxHeightAboveTerrain, targetRef, velocityRef])

	return checkElevationBounds
}

export default useElevationBounds
