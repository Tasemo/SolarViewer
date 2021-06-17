import { Constants } from "../constants";

export default class SliderElement {

    private element: HTMLElement;
    private scrollOffset: number;
    private interval: number;
    private active = false;

    constructor(element: HTMLElement) {
        const sliderArea = element.querySelector(".sliderArea")!;
        sliderArea.addEventListener("click", event => event.stopPropagation());
        element.style.left = element.getBoundingClientRect().left + sliderArea.clientWidth + "px"
        this.element = element;
        this.scrollOffset = -sliderArea.clientWidth;
        this.interval = Constants.SLIDER_SPEED / 1 / 60;
        element.addEventListener("click", this.onClick.bind(this));
    }

    onClick() {
        if (!this.active) {
            this.active = true;
            const target = this.element.getBoundingClientRect().left + this.scrollOffset;
            const interval = setInterval(() => {
                const currentX = this.element.getBoundingClientRect().left
                let done;
                if (this.scrollOffset > 0) {
                    done = currentX >= target;
                } else {
                    done = currentX <= target;
                }
                if (done) {
                    clearInterval(interval);
                    this.element.style.left = target + "px";
                    this.active = false;
                    this.scrollOffset = -this.scrollOffset;
                } else {
                    this.element.style.left = (currentX + this.scrollOffset / this.interval) + "px";
                }
            }, this.interval)
        }
    }
}