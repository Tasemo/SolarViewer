import SliderElement from './sliderElement';

export default class InfoArea extends SliderElement {

    constructor() {
        const element: HTMLElement = document.querySelector("#infoArea")!;
        super(element, -element.clientWidth + 20, 1000, 100)
    }    
}