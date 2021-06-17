import SliderElement from './sliderElement';
import WorldController from '../worldController';
import { Projections } from '../projections';

export default class ConfigArea extends SliderElement {

    constructor(worldController: WorldController) {
        super(document.querySelector("#configArea")!)
        const projection: HTMLInputElement = document.querySelector("#projection")!;
        projection.addEventListener("change", () => {
            const value = projection.checked ? Projections.SPHERICAL : Projections.FLAT
            worldController.modelLoader.projection = value;
            worldController.reload();
        })
    }
}