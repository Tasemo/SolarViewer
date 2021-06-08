#version 420 core

layout(location = 0) in vec3 in_position;

uniform mat4 modelViewProjectionMatrix;

void main(void) {
    gl_Position = modelViewProjectionMatrix * vec4(in_position, 1.0f);
}