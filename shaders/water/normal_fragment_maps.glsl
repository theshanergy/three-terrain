#include <normal_fragment_maps>
vec4 noise = getNoise(vWorldXZ * size);
vec3 surfaceNormal = normalize(noise.xzy * vec3(1.5, 1.0, 1.5));
normal = normalize((viewMatrix * vec4(surfaceNormal, 0.0)).xyz);
