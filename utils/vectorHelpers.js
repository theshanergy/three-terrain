/**
 * Normalize a 3D direction vector
 * @param {number[]} arr - Direction array [x, y, z]
 * @returns {number[]} Normalized direction array
 */
export const normalizeDirection = (arr) => {
	const len = Math.sqrt(arr[0] * arr[0] + arr[1] * arr[1] + arr[2] * arr[2])
	return len > 0 ? [arr[0] / len, arr[1] / len, arr[2] / len] : [0, 1, 0]
}
