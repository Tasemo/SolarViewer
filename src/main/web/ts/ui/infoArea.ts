import { Constants } from '../constants';
import SliderElement from './sliderElement';

function computeColors(steps: number): string {
    const colors = [];
    for (let i = 1; i <= steps; i++) {
        const hue = 360 * (Constants.HUE_CUTOFF - (Constants.HUE_CUTOFF / steps * i));
        colors[i - 1] = `hsl(${hue}, 100%, 50%)`
    }
    return colors.join(",");
}

export default class InfoArea extends SliderElement {

    constructor() {
        super(document.querySelector("#infoArea")!)
        const heightScale: HTMLElement = document.querySelector("#heightScale")!;
        const color = "linear-gradient(to right," + computeColors(10) + ")";
        heightScale.style.background = color;
    }
}