in float terrainHeightMeters;

uniform float minHeight;
uniform float maxHeight;
uniform float hueCutoff;

float map(float value, float min1, float max1, float min2, float max2) {
    float factor = min2 + (value - min1) * (max2 - min2) / (max1 - min1);
    return clamp(factor, min2, max2);
}

// http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main(void) {
    float factor = map(terrainHeightMeters, minHeight, maxHeight, 0.0, hueCutoff);
    gl_FragColor = vec4(hsv2rgb(vec3(hueCutoff - factor, 1.0, 1.0)), 1.0);
}