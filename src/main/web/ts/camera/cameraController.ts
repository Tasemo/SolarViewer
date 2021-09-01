/**
 * A camera controller that modifies a given {@link THREE.Camera} based on some user input if it is enabled.
 * The {@link CameraController.update} method must be called each frame to allow for smooth translations.
 */
export default interface CameraController {

    /**
     * If disabled, the provided camera is not updated in any way.
     */
    enabled: boolean;

    /**
     * Updates the camera based on some user input. It is generally only used if the update has to happen over a fixed time span, not by an absolute value.
     * 
     * @param frameTimeSeconds the time in seconds since the last frame was shown
     */
    update(frameTimeSeconds: number): void;
}