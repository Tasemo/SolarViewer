/**
 * Defines several constants used by the whole application.
 */
export abstract class Constants {

    public readonly url: string;
    public readonly meterPerPixel: number;
    public readonly pixelsWidth: number;
    public readonly pixelsHeight: number;
    public readonly radiusMeters: number;

    constructor(url:string, meterPerPixel: number, pixelsWidth: number, pixelsHeight: number, radiusMeters: number) {
        this.url = url;
        this.meterPerPixel = meterPerPixel;
        this.pixelsWidth = pixelsWidth;
        this.pixelsHeight = pixelsHeight;
        this.radiusMeters = radiusMeters;
    }

    static readonly CHUNK_SIZE_PIXELS = 2880;
    static readonly METER_PER_GL_UNIT = 10000;
    static readonly MOVEMENT_SPEED = 100;
    static readonly ROTATION_SPEED = 0.002;
    static readonly SCROLL_SPEED = 4;
    static readonly SLIDER_SPEED = 2000;
    static readonly HUE_CUTOFF = 0.7;
    static readonly VIEW_CHANGE_THROTTLE = 1000;
    
    public get pixelsPerGlUnit(): number {
        return 1 / this.meterPerPixel / Constants.METER_PER_GL_UNIT;
    }

    public get chunkWidth(): number {
        return this.pixelsWidth / Constants.CHUNK_SIZE_PIXELS;
    }

    public get chunkHeight(): number {
        return this.pixelsHeight / Constants.CHUNK_SIZE_PIXELS;
    }

    public get meterPerChunk(): number {
        return Constants.CHUNK_SIZE_PIXELS * this.meterPerPixel;
    }

    public get radiusGlUnits(): number {
        return this.radiusMeters / Constants.METER_PER_GL_UNIT;
    }
}

export class MolaConstants extends Constants {

    public static readonly INSTANCE = new MolaConstants();

    private constructor() {
        super("mola", 463.0835744, 46080, 23040, 3396190)
    }
}

export class LolaConstants extends Constants {

    public static readonly INSTANCE = new LolaConstants();

    private constructor() {
        super("lola", 118.4505876, 92160, 46080, 1737400)
    }
}

export class MessengerConstants extends Constants {

    public static readonly INSTANCE = new MessengerConstants();

    private constructor() {
        super("messenger", 665.24315270546, 23040, 11520, 2439400)
    }
}
