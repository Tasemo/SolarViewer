import SliderElement from './sliderElement';
import WorldController from '../worldController';
import { Projections } from '../projections';
import * as THREE from 'three';
import CameraController from '../camera/cameraController';
import FreeFlyCamera from '../camera/freeFlyCamera';
import OrbitCamera from '../camera/orbitCamera';

export default class ConfigArea extends SliderElement {

    private freeFlyCamera: FreeFlyCamera;
    private orbitCamera: OrbitCamera;
    private previouslyLocked = true;
    private cameraInput: HTMLInputElement;
    current: CameraController;

    constructor(worldController: WorldController, uniforms: { [uniform: string]: THREE.IUniform }) {
        super(document.querySelector("#configArea")!)
        this.freeFlyCamera = new FreeFlyCamera(worldController.camera);
        this.orbitCamera = new OrbitCamera(worldController.camera, new THREE.Vector3());
        this.current = this.orbitCamera;
        this.freeFlyCamera.enabled = false;
        this.cameraInput = document.querySelector("#lockedCamera")!;
        this.configureProjectionInput(worldController, uniforms);
        this.configureScaleInput(uniforms);
        this.configureCameraInput();
    }

    private configureProjectionInput(worldController: WorldController, uniforms: { [uniform: string]: THREE.IUniform }) {
        const projection: HTMLInputElement = document.querySelector("#projection")!;
        projection.addEventListener("change", (() => {
            const value = projection.checked ? Projections.SPHERICAL : Projections.FLAT;
            worldController.modelLoader.projection = value;
            if (projection.checked) {
                this.cameraInput.checked = this.previouslyLocked;
                this.cameraInput.disabled = false;
                if (this.previouslyLocked) {
                    this.setCurrent(this.orbitCamera);
                }
            } else {
                this.previouslyLocked = this.cameraInput.checked;
                this.cameraInput.checked = false;
                this.cameraInput.disabled = true;
                if (this.previouslyLocked) {
                    this.setCurrent(this.freeFlyCamera);
                }
            }
            uniforms["projected"]!.value = projection.checked;
            worldController.reload();
        }).bind(this))
    }

    private configureScaleInput(uniforms: { [uniform: string]: THREE.IUniform }) {
        const minHeightInput: HTMLInputElement = document.querySelector("#minHeightInput")!;
        const minHeight = document.querySelector("#minHeight")!;
        const maxHeightInput: HTMLInputElement = document.querySelector("#maxHeightInput")!;
        const maxHeight = document.querySelector("#maxHeight")!;
        minHeightInput.addEventListener("change", (() => {
            if (parseInt(minHeightInput.value) >= parseInt(maxHeightInput.value)) {
                minHeightInput.setCustomValidity("Mininum height must be smaller than the maximum.")
            } else {
                minHeightInput.setCustomValidity("");
            }
            if (minHeightInput.checkValidity()) {
                minHeight.textContent = minHeightInput.value + "m";
                uniforms["minHeight"]!.value = parseInt(minHeightInput.value);
            } else {
                minHeightInput.reportValidity();
            }
        }).bind(this))
        maxHeightInput.addEventListener("change", (() => {
            if (parseInt(maxHeightInput.value) <= parseInt(minHeightInput.value)) {
                maxHeightInput.setCustomValidity("Maximum height must be greater than the minimum.")
            } else {
                maxHeightInput.setCustomValidity("");
            }
            if (maxHeightInput.checkValidity()) {
                maxHeight.textContent = maxHeightInput.value + "m";
                uniforms["maxHeight"]!.value = parseInt(maxHeightInput.value);
            } else {
                maxHeightInput.reportValidity();
            }
        }).bind(this))
    }

    private configureCameraInput() {
        this.cameraInput.addEventListener("change", (() => {
            this.setCurrent(this.cameraInput.checked ? this.orbitCamera : this.freeFlyCamera);
        }).bind(this))
    }

    private setCurrent(camera: CameraController) {
        this.current.enabled = false;
        this.current = camera;
        this.current.enabled = true;
    }
}