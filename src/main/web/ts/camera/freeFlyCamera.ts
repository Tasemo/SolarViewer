import * as THREE from "three";
import { Constants } from "../constants";
import Throttle from '../throttle';
import CameraController from './cameraController';

export default class FreeFlyCamera implements CameraController {

    private readonly changeEvent = { type: "viewChange" };

    enabled = true;
    private camera: THREE.Camera;
    private movement = new THREE.Vector3();
    private eventThrottle = new Throttle((() => this.camera.dispatchEvent(this.changeEvent)).bind(this), Constants.VIEW_CHANGE_THROTTLE);
    private dragging = false;

    constructor(camera: THREE.Camera) {
        this.camera = camera;
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
        window.addEventListener("mousedown", (() => this.dragging = true).bind(this));
        window.addEventListener("mouseup", (() => this.dragging = false).bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    update(frameTimeSeconds: number) {
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
                    this.movement.z = -Constants.MOVEMENT_SPEED;
                    break;
                case "KeyA":
                    this.movement.x = -Constants.MOVEMENT_SPEED;
                    break;
                case "KeyS":
                    this.movement.z = Constants.MOVEMENT_SPEED;
                    break;
                case "KeyD":
                    this.movement.x = Constants.MOVEMENT_SPEED;
                    break;
            }
        }
    }

    private onKeyUp(event: KeyboardEvent) {
        switch (event.code) {
            case "KeyW":
            case "KeyS":
                this.movement.z = 0;
                break;
            case "KeyA":
            case "KeyD":
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
