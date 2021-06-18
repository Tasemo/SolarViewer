import SliderElement from './sliderElement';
import WorldController from '../worldController';
import { Projections } from '../projections';
import * as THREE from 'three';

export default class ConfigArea extends SliderElement {

    constructor(worldController: WorldController, uniforms: { [uniform: string]: THREE.IUniform }) {
        super(document.querySelector("#configArea")!)
        const projection: HTMLInputElement = document.querySelector("#projection")!;
        projection.addEventListener("change", () => {
            const value = projection.checked ? Projections.SPHERICAL : Projections.FLAT;
            worldController.modelLoader.projection = value;
            uniforms["projected"]!.value = projection.checked;
            worldController.reload();
        })
        const minHeightInput: HTMLInputElement = document.querySelector("#minHeightInput")!;
        const minHeight = document.querySelector("#minHeight")!;
        const maxHeightInput: HTMLInputElement = document.querySelector("#maxHeightInput")!;
        const maxHeight = document.querySelector("#maxHeight")!;
        minHeightInput.addEventListener("change", () => {
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
        })
        maxHeightInput.addEventListener("change", () => {
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
        })
    }
}