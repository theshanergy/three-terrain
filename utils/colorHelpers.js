import { Color } from 'three'

/**
 * Convert RGB array [r, g, b] to HSL object {h, s, l}
 * @param {number[]} rgb - RGB values as array [r, g, b] (0-1 range)
 * @returns {{h: number, s: number, l: number}} HSL values
 */
export const rgbToHsl = (rgb) => {
	const color = new Color(rgb[0], rgb[1], rgb[2])
	const hsl = {}
	color.getHSL(hsl)
	return hsl
}

/**
 * Convert HSL values to RGB array [r, g, b]
 * @param {number} h - Hue (0-1)
 * @param {number} s - Saturation (0-1)
 * @param {number} l - Lightness (0-1)
 * @returns {number[]} RGB values as array [r, g, b]
 */
export const hslToRgb = (h, s, l) => {
	const color = new Color().setHSL(h, s, l)
	return [color.r, color.g, color.b]
}
