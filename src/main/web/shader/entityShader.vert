uniform float meterPerGLUnit;

out float terrainHeightMeters;

void main(void) {
    terrainHeightMeters = position.y * meterPerGLUnit;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0f);
}