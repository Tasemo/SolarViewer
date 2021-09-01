/**
 * A throttle limits the amount of times a given delegate function is called. It is ensured, that
 * the delegate is called after the timeout even if the throttle is never invoked again.
 */
export default class Throttle {

    private func: Function;
    private limitMs: number;
    private lastRunTime = Date.now();
    private lastTimeout: number | undefined;

    constructor(func: Function, limitMs: number) {
        this.func = func;
        this.limitMs = limitMs;
    }

    public apply(...args: any[]) {
        window.clearTimeout(this.lastTimeout);
        this.lastTimeout = window.setTimeout((() => {
            this.func.apply(args);
            this.lastRunTime = Date.now();
        }).bind(this), this.limitMs - (Date.now() - this.lastRunTime));
    }
}