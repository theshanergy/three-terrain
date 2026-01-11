vec3 worldToEye = eye - vWaterWorldPosition;
vec3 eyeDirection = normalize(worldToEye);
float distanceToEye = length(worldToEye);

float mirrorW = max(vMirrorCoord.w, 0.001);
vec2 baseReflectionUV = vMirrorCoord.xy / mirrorW;
vec2 distortion = surfaceNormal.xz * (0.001 + 1.0 / distanceToEye) * distortionScale;
vec2 reflectionUV = baseReflectionUV + distortion;
bool validReflection = reflectionUV.x > 0.0 && reflectionUV.x < 1.0 &&
	reflectionUV.y > 0.0 && reflectionUV.y < 1.0 &&
	vMirrorCoord.w > 0.1;
vec3 reflectionSample = validReflection ? vec3(texture2D(mirrorSampler, reflectionUV)) : vec3(0.0);

float theta = max(dot(eyeDirection, surfaceNormal), 0.0);
float rf0 = 0.3;
float reflectance = rf0 + (1.0 - rf0) * pow((1.0 - theta), 5.0);

vec3 reflectionDir = reflect(-eyeDirection, surfaceNormal);
vec3 skyReflection = GetSkyColour(reflectionDir, normalize(sunDirection), skyColor, skyHorizonColor, sunColor);

float mirrorBlend = validReflection ? smoothstep(0.1, 0.5, vMirrorCoord.w) : 0.0;
vec3 finalReflection = mix(skyReflection, reflectionSample, mirrorBlend);

float depthFactor = smoothstep(0.0, maxVisibleDepth, vDepth);
vec3 depthBlendedColor = mix(waterColor * 2.5, waterColor, depthFactor);
vec3 scatter = max(0.0, dot(surfaceNormal, eyeDirection)) * depthBlendedColor;

outgoingLight = mix(outgoingLight + scatter, finalReflection, reflectance);

float edgeFade = smoothstep(0.0, edgeFadeDistance, vDepth);
float depthAlpha = mix(0.6, 1.0, depthFactor) * edgeFade;
float distanceBasedSmoothing = smoothstep(100.0, 500.0, vCameraDistance);
float smoothedEdgeFade = edgeFadeDistance * (1.0 + distanceBasedSmoothing * 8.0);
float distanceEdgeFade = smoothstep(0.0, smoothedEdgeFade, vDepth);
depthAlpha *= distanceEdgeFade;
diffuseColor.a *= depthAlpha;

#include <opaque_fragment>
