import * as THREE from 'three';
import SliderElement from './sliderElement';
import WorldController from '../worldController';
import { FlatProjection, SphericalProjection } from '../projections';
import CameraController from '../camera/cameraController';
import FreeFlyCamera from '../camera/freeFlyCamera';
import OrbitCamera from '../camera/orbitCamera';
import { LolaConstants, MessengerConstants, MolaConstants } from '../constants';

export default class ConfigArea extends SliderElement {

    private readonly freeFlyCamera: FreeFlyCamera;
    private readonly orbitCamera: OrbitCamera;
    private previouslyLocked = true;
    private readonly cameraInput: HTMLInputElement;
    public currentCamera: CameraController;
    private currentPlanet = "mars";

    constructor(worldController: WorldController, uniforms: { [uniform: string]: THREE.IUniform }) {
        super(document.querySelector("#configArea")!)
        this.freeFlyCamera = new FreeFlyCamera(worldController.camera);
        this.orbitCamera = new OrbitCamera(worldController.camera, new THREE.Vector3());
        this.currentCamera = this.orbitCamera;
        this.freeFlyCamera.enabled = false;
        this.cameraInput = document.querySelector("#lockedCamera")!;
        this.configureProjectionInput(worldController, uniforms);
        this.configureScaleInput(uniforms);
        this.configureCameraInput();
        this.configurePlanetInput(worldController, uniforms);
    }

    private configureProjectionInput(worldController: WorldController, uniforms: { [uniform: string]: THREE.IUniform }) {
        const projection: HTMLInputElement = document.querySelector("#projection")!;
        projection.addEventListener("change", (() => {
            const value = projection.checked ? SphericalProjection.INSTANCE : FlatProjection.INSTANCE;
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

    private async configurePlanetInput(worldController: WorldController, uniforms: { [uniform: string]: THREE.IUniform }) {        
        const planetInput: HTMLSelectElement = document.querySelector("#planet")!;
        const avilailableData = (await (await fetch("available")).text()).split(",");
        for (let i = 0; i < avilailableData.length; i++) {
            planetInput.options[i] = new Option(avilailableData[i], avilailableData[i]);
        }
        planetInput.addEventListener("change", (() => {
            if (planetInput.value !== this.currentPlanet) {
                if (planetInput.value === "Mars") {
                    worldController.modelLoader.constants = MolaConstants.INSTANCE;
                } else if (planetInput.value === "Moon") {
                    worldController.modelLoader.constants = LolaConstants.INSTANCE;
                } else if (planetInput.value === "Mercury") {
                    worldController.modelLoader.constants = MessengerConstants.INSTANCE;
                }
                this.currentPlanet = planetInput.value;
                uniforms["radius"]!.value =  worldController.modelLoader.constants.radiusMeters;
                worldController.reload();
            }
        }).bind(this));
    }

    private configureCameraInput() {
        this.cameraInput.addEventListener("change", (() => {
            this.setCurrent(this.cameraInput.checked ? this.orbitCamera : this.freeFlyCamera);
        }).bind(this))
    }

    private setCurrent(camera: CameraController) {
        this.currentCamera.enabled = false;
        this.currentCamera = camera;
        this.currentCamera.enabled = true;
    }
}