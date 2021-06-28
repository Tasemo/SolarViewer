import * as THREE from "three";
import { Constants } from "../constants";
import Throttle from '../throttle';
import CameraController from './cameraController';

export default class OrbitCamera implements CameraController {

    private readonly changeEvent = { type: "viewChange" };

    enabled = true;
    private camera: THREE.Camera;
    private eventThrottle = new Throttle((() => this.camera.dispatchEvent(this.changeEvent)).bind(this), Constants.VIEW_CHANGE_THROTTLE);
    private dragging = false;
    private minDistance: number;
    private maxDistance: number;
    private pivot = new THREE.Object3D();

    constructor(camera: THREE.Camera, target: THREE.Vector3, minDistance = 0, maxDistance = Infinity) {
        this.camera = camera;
        this.pivot.position.copy(target);
        this.pivot.add(camera);
        this.minDistance = minDistance;
        this.maxDistance = maxDistance;
        window.addEventListener("mousedown", (() => this.dragging = true).bind(this));
        window.addEventListener("mouseup", (() => this.dragging = false).bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
    }

    update(frameTimeSeconds: number) { }

    private onMouseMove(event: MouseEvent) {
        if (this.enabled && this.dragging) {
            this.pivot.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), event.movementX * Constants.ROTATION_SPEED);
            this.pivot.rotateOnAxis(new THREE.Vector3(1, 0, 0), event.movementY * Constants.ROTATION_SPEED);
            this.pivot.updateMatrixWorld(true);
            this.eventThrottle.apply();
        }
    }
}