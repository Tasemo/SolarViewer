import SliderElement from './sliderElement';
import WorldController from '../worldController';
import { Projections } from '../projections';
import * as THREE from 'three';

export default class ConfigArea extends SliderElement {

    constructor(worldController: WorldController, minHeightUniform: THREE.IUniform, maxHeightUniform: THREE.IUniform) {
        super(document.querySelector("#configArea")!)
        const projection: HTMLInputElement = document.querySelector("#projection")!;
        projection.addEventListener("change", () => {
            const value = projection.checked ? Projections.SPHERICAL : Projections.FLAT
            worldController.modelLoader.projection = value;
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
                minHeightUniform.value = parseInt(minHeightInput.value);
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
                maxHeightUniform.value = parseInt(maxHeightInput.value);
            } else {
                maxHeightInput.reportValidity();
            }
        })
    }
}