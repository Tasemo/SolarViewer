import * as THREE from "three";
import { Constants } from "./constants";

export default class CameraController {

    private camera: THREE.Camera;
    private movement = new THREE.Vector3();
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
            this.camera.dispatchEvent({ type: "viewChange" });
        }
    }

    private onKeyDown(event: KeyboardEvent) {
        if (!event.repeat) {
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
                case "KeyQ":
                    this.movement.y = Constants.MOVEMENT_SPEED;
                    break;
                case "KeyE":
                    this.movement.y = -Constants.MOVEMENT_SPEED;
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
            case "KeyQ":
            case "KeyE":
                this.movement.y = 0;
                break;
        }
    }

    private onMouseMove(event: MouseEvent) {
        if (this.dragging) {
            this.camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), event.movementX * Constants.ROTATION_SPEED);
            this.camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), event.movementY * Constants.ROTATION_SPEED);
            this.camera.dispatchEvent({ type: "viewChange" });
        }
    }
}
