out float terrainHeightMeters;

uniform float meterPerGLUnit;
uniform float radius;
uniform bool projected;

void main(void) {
    terrainHeightMeters = projected ? length(position * meterPerGLUnit) - radius : position.y * meterPerGLUnit;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0f);
}