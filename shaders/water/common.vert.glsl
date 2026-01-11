uniform mat4 textureMatrix;
uniform float time;
uniform vec4 waveA;
uniform vec4 waveB;
uniform vec4 waveC;
uniform float shorelineDepthThreshold;
uniform float shallowDepthThreshold;

attribute float depth;

varying vec4 vMirrorCoord;
varying float vDepth;
varying vec2 vWorldXZ;
varying float vCameraDistance;
varying vec3 vWaterWorldPosition;

vec3 GerstnerWave(vec4 wave, vec3 p, float waveScale) {
	float steepness = wave.z * waveScale;
	float wavelength = wave.w;
	float k = 2.0 * PI / wavelength;
	float c = sqrt(9.8 / k);
	vec2 d = normalize(wave.xy);
	float f = k * (dot(d, vec2(p.x, p.z)) - c * time);
	float a = steepness / k;

	return vec3(
		d.x * (a * cos(f)),
		a * sin(f),
		d.y * (a * cos(f))
	);
}
