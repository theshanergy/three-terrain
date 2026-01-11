uniform sampler2D mirrorSampler;
uniform sampler2D normalSampler;
uniform float time;
uniform float size;
uniform float distortionScale;
uniform vec3 sunColor;
uniform vec3 sunDirection;
uniform vec3 eye;
uniform vec3 waterColor;
uniform vec3 skyColor;
uniform vec3 skyHorizonColor;
uniform float maxVisibleDepth;
uniform float edgeFadeDistance;

varying vec4 vMirrorCoord;
varying float vDepth;
varying vec2 vWorldXZ;
varying float vCameraDistance;
varying vec3 vWaterWorldPosition;

vec4 getNoise(vec2 uv) {
	vec2 uv0 = (uv / 103.0) + vec2(time / 17.0, time / 29.0);
	vec2 uv1 = uv / 107.0 - vec2(time / -19.0, time / 31.0);
	vec2 uv2 = uv / vec2(8907.0, 9803.0) + vec2(time / 101.0, time / 97.0);
	vec2 uv3 = uv / vec2(1091.0, 1027.0) - vec2(time / 109.0, time / -113.0);
	vec4 noise = texture2D(normalSampler, uv0) +
		texture2D(normalSampler, uv1) +
		texture2D(normalSampler, uv2) +
		texture2D(normalSampler, uv3);
	return noise * 0.5 - 1.0;
}

vec3 GetSkyColour(vec3 vRayDir, vec3 vSunDir, vec3 vSkyColor, vec3 vSkyHorizonColor, vec3 vSunColor) {
	float elevation = max(0.0, vRayDir.y);
	float skyBlend = pow(elevation, 0.5);
	vec3 vSkyColour = mix(vSkyHorizonColor, vSkyColor, skyBlend);

	float fSunDotV = max(0.0, dot(vSunDir, vRayDir));
	float sunGlow = pow(fSunDotV, 8.0) * 0.3;
	vSkyColour += vSunColor * sunGlow * (1.0 - elevation * 0.5);

	float horizonHaze = pow(1.0 - elevation, 12.0) * 0.15;
	vSkyColour = mix(vSkyColour, vec3(0.9, 0.92, 0.95), horizonHaze);

	return vSkyColour;
}
