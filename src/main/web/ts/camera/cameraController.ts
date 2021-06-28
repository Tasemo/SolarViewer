export default interface CameraController {

    enabled: boolean;
    update(frameTimeSeconds: number): void;
}