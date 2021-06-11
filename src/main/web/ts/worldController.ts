import { Constants } from './constants';
import ModelLoader from './modelLoader';

export default class WorldController {

    private chunks: Array<Array<boolean>> = [[]];
    private camera: THREE.Camera;
    private modelLoader: ModelLoader;
    private pixelsPerGLUnit: number;
    private onGeometryLoad: (geometry: THREE.BufferGeometry) => void

    constructor(camera: THREE.Camera, modelLoader: ModelLoader, pixelsPerGLUnit: number, onGeometryLoad: (geometry: THREE.BufferGeometry) => void) {
        this.camera = camera;
        this.modelLoader = modelLoader;
        this.pixelsPerGLUnit = pixelsPerGLUnit;
        this.onGeometryLoad = onGeometryLoad;
        this.load(0, 0);
        this.load(0, Constants.CHUNK_SIZE_PIXELS);
        camera.addEventListener("viewChange", this.onViewChange.bind(this));
    }

    async onViewChange() {

    }

    async load(x: number, y:number) {
        if (!this.chunks[x]![y]) {
            this.chunks[x]![y] = true;
            console.log("Loading: " + x + ", " + y);
            const geometry = await this.modelLoader.load(x, y);
            this.onGeometryLoad(geometry);
        }
    }
}