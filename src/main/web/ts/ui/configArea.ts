import SliderElement from './sliderElement';

export default class ConfigArea extends SliderElement {

    constructor() {
        const element: HTMLElement = document.querySelector("#configArea")!;
        super(element, element.clientWidth - 20, 1000, 100)
    }
}