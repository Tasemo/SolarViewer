in float height;

out float terrainHeightMeters;

void main(void) {
    terrainHeightMeters = height;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0f);
}