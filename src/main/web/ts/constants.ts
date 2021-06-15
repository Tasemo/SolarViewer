export namespace Constants {
    export const CHUNK_SIZE_PIXELS = 11520;
    export const GLOBAL_STRIDE = 64;
    export const METER_PER_GL_UNIT = 10000;
    export const MOLA_METER_PER_PIXEL = 463.0835744;
    export const MOLA_PIXELS_PER_GL_UNIT = 1 / MOLA_METER_PER_PIXEL / METER_PER_GL_UNIT;
    export const MOLA_PIXELS_WIDTH = 46080;
    export const MOLA_PIXELS_HEIGHT = 23040;
    export const MOLA_RADIUS_METERS = 3396190;
    export const MOLA_CHUNKS_WIDTH = MOLA_PIXELS_WIDTH / CHUNK_SIZE_PIXELS;
    export const MOLA_CHUNKS_HEIGHT = MOLA_PIXELS_HEIGHT / CHUNK_SIZE_PIXELS;
    export const MOVEMENT_SPEED = 1000;
    export const ROTATION_SPEED = 0.002;
}