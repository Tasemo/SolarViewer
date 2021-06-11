import * as THREE from "three";

export default class CameraController {

    private keyboardSpeed: number;
    private rotationSpeed: number;
    private camera: THREE.Camera;
    private movement = new THREE.Vector3();
    private dragging = false;

    constructor(camera: THREE.Camera, keyboardSpeed: number, rotationSpeed: number) {
        this.camera = camera;
        this.keyboardSpeed = keyboardSpeed;
        this.rotationSpeed = rotationSpeed;
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
        window.addEventListener("mousedown", (() => this.dragging = true).bind(this));
        window.addEventListener("mouseup", (() => this.dragging = false).bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    update(frameTimeSeconds: number) {
        const scaled = this.movement.clone();
        scaled.multiplyScalar(frameTimeSeconds);
        this.camera.translateX(scaled.x);
        this.camera.translateY(scaled.y);
        this.camera.translateZ(scaled.z);
    }

    onKeyDown(event: KeyboardEvent) {
        if (!event.repeat) {
            switch (event.code) {
                case "KeyW":
                    this.movement.z = -this.keyboardSpeed;
                    break;
                case "KeyA":
                    this.movement.x = -this.keyboardSpeed;
                    break;
                case "KeyS":
                    this.movement.z = this.keyboardSpeed;
                    break;
                case "KeyD":
                    this.movement.x = this.keyboardSpeed;
                    break;
                case "KeyQ":
                    this.movement.y = this.keyboardSpeed;
                    break;
                case "KeyE":
                    this.movement.y = -this.keyboardSpeed;
                    break;
            }
        }
    }

    onKeyUp(event: KeyboardEvent) {
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

    onMouseMove(event: MouseEvent) {
        if (this.dragging) {
            this.camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), event.movementX * this.rotationSpeed);
            this.camera.rotateOnAxis(new THREE.Vector3(1, 0, 0), event.movementY * this.rotationSpeed);
        }
    }
}
