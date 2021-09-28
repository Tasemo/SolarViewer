import * as THREE from "three";
import { Constants } from "../constants";
import Throttle from '../throttle';
import CameraController from './cameraController';

/**
 * A camera controller that allows the camera to pivot around a fixed point at a certain distance by dragging the mouse. The distance
 * can be adjusted by the mouse wheel as is guaranteed to stay between a configurable distance.
 */
export default class OrbitCamera implements CameraController {

    private readonly changeEvent = { type: "viewChange" };

    public enabled = true;
    private readonly camera: THREE.Camera;
    private readonly eventThrottle = new Throttle((() => this.camera.dispatchEvent(this.changeEvent)).bind(this), Constants.VIEW_CHANGE_THROTTLE);
    private dragging = false;
    private readonly minDistance: number;
    private readonly maxDistance: number;
    private readonly pivot = new THREE.Object3D();

    constructor(camera: THREE.Camera, target: THREE.Vector3, minDistance = 0, maxDistance = Number.MAX_VALUE) {
        this.camera = camera;
        this.pivot.position.copy(target);
        this.pivot.add(camera);
        this.minDistance = minDistance;
        this.maxDistance = maxDistance;
        window.addEventListener("mousedown", (() => this.dragging = true).bind(this));
        window.addEventListener("mouseup", (() => this.dragging = false).bind(this));
        window.addEventListener("mousemove", this.onMouseMove.bind(this));
        window.addEventListener("wheel", this.onMouseWheel.bind(this));
    }

    update(frameTimeSeconds: number) { }

    private onMouseWheel(event: WheelEvent) {
        if (this.enabled) {
            let change = Math.sign(event.deltaY) * Constants.SCROLL_SPEED;
            const current = this.camera.position.z;
            if (change + current > this.maxDistance) {
                change = this.maxDistance - current;
            } else if (change + current < this.minDistance) {
                change = this.minDistance - current;
            }
            if (change !== 0) {
                this.camera.translateOnAxis(new THREE.Vector3(0, 0, 1), change);
                this.camera.updateMatrixWorld(true);
                this.eventThrottle.apply();
            }
        }
    }

    private onMouseMove(event: MouseEvent) {
        if (this.enabled && this.dragging) {
            this.pivot.rotateOnWorldAxis(new THREE.Vector3(0, -1, 0), event.movementX * Constants.ROTATION_SPEED);
            this.pivot.rotateOnAxis(new THREE.Vector3(-1, 0, 0), event.movementY * Constants.ROTATION_SPEED);
            this.pivot.updateMatrixWorld(true);
            this.eventThrottle.apply();
        }
    }
}