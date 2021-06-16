export default class SliderElement {

    private element: HTMLElement;
    private scrollOffset: number;
    private time: number;
    private steps: number;
    private active = false;

    constructor(element: HTMLElement, scrollOffset: number, time: number, steps: number) {
        this.element = element;
        this.scrollOffset = scrollOffset;
        this.time = time;
        this.steps = steps;
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
                    done = currentX > target;
                } else {
                    done = currentX < target;
                }
                if (done) {
                    clearInterval(interval);
                    this.active = false;
                    this.scrollOffset = -this.scrollOffset;
                } else {
                    this.element.style.left = (currentX + this.scrollOffset / this.steps) + "px";
                }
            }, this.time / this.steps)
        }
    }
}