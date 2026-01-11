float waveScale = smoothstep(shorelineDepthThreshold, shallowDepthThreshold, depth);
waveScale = waveScale * waveScale * (3.0 - 2.0 * waveScale);

vec3 worldSpacePos = vec3(uv.x, 0.0, uv.y);
vWorldXZ = uv;

vec3 waveDisplacement = vec3(0.0);
waveDisplacement += GerstnerWave(waveA, worldSpacePos, waveScale);
waveDisplacement += GerstnerWave(waveB, worldSpacePos, waveScale);
waveDisplacement += GerstnerWave(waveC, worldSpacePos, waveScale);

vec3 transformed = position + waveDisplacement;
vDepth = depth;
