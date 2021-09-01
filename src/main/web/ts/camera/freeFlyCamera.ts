import * as THREE from "three";
import { Constants } from "../constants";
import Throttle from '../throttle';
import CameraController from './cameraController';

/**
 * A camera controller that allows changing the cameras orientation by dragging the mouse and
 * allows for moving along the orientation with keyboard input (arrow keys and WASD).
 */
export default class FreeFlyCamera implements CameraController {

    private readonly changeEvent = { type: "viewChange" };

    public enabled = true;
    private readonly camera: THREE.Camera;
    private readonly movement = new THREE.Vector3();
    private readonly eventThrottle = new Throttle((() => this.camera.dispatchEvent(this.changeEvent)).bind(this), Constants.VIEW_CHANGE_THROTTLE);
    private dragging = false;

    constructor(camera: THREE.Camera) {
        this.camera = camera;
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
        window.addEventListener("mousedown", (() => this.dragging = true).bind(this));
        window.addEventListener("mouseup", (() => this.dragging = false).bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    public update(frameTimeSeconds: number) {
        if (this.movement.lengthSq() !== 0) {
            const scaled = this.movement.clone();
            scaled.multiplyScalar(frameTimeSeconds);
            this.camera.translateX(scaled.x);
            this.camera.translateY(scaled.y);
            this.camera.translateZ(scaled.z);
            this.camera.updateMatrixWorld(true);
            this.eventThrottle.apply();
        }
    }

    private onKeyDown(event: KeyboardEvent) {
        if (this.enabled && event.repeat) {
            switch (event.code) {
                case "KeyW":
                case "ArrowUp":
                    this.movement.z = -Constants.MOVEMENT_SPEED;
                    break;
                case "KeyA":
                case "ArrowLeft":
                    this.movement.x = -Constants.MOVEMENT_SPEED;
                    break;
                case "KeyS":
                case "ArrowDown":
                    this.movement.z = Constants.MOVEMENT_SPEED;
                    break;
                case "KeyD":
                case "ArrowRight":
                    this.movement.x = Constants.MOVEMENT_SPEED;
                    break;
            }
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        switch (event.code) {
            case "KeyW":
            case "ArrowUp":
            case "KeyS":
            case "ArrowDown":
                this.movement.z = 0;
                break;
            case "KeyA":
            case "ArrowLeft":
            case "KeyD":
            case "ArrowRight":
                this.movement.x = 0;
                break;
        }
    }

    private onMouseMove(event: MouseEvent) {
        if (this.enabled && this.dragging) {
            this.camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), event.movementX * Constants.ROTATION_SPEED);
            this.camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), event.movementY * Constants.ROTATION_SPEED);
            this.camera.updateMatrixWorld(true);
            this.eventThrottle.apply();
        }
    }
}
