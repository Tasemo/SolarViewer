export default class Throttle {

    private func: Function;
    private limitMs: number;
    private inThrottle = false;

    constructor(func: Function, limitMs: number) {
        this.func = func;
        this.limitMs = limitMs;
    }

    apply(...args: any[]) {
        if (!this.inThrottle) {
            this.func.apply(args);
            this.inThrottle = true;
            window.setTimeout((() => this.inThrottle = false).bind(this), this.limitMs);
        }
    }
}