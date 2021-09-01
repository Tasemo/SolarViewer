import { Constants } from "../constants";

/**
 * A slider element extends any element to be able to slide in and out smoothly at a duration specified by {@link Constants.SLIDER_SPEED}.
 * The element has to allow for absolute positioning.
 */
export default abstract class SliderElement {

    private readonly element: HTMLElement;
    private scrollOffset: number;
    private readonly interval: number;
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

    private onClick() {
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