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
        for (let x = 0; x < Constants.MOLA_CHUNKS_WIDTH; x++) {
            for (let z = 0; z < Constants.MOLA_PIXELS_HEIGHT; z++) {
                this.load(x, z);
            }
        }
        camera.addEventListener("viewChange", this.onViewChange.bind(this));
    }

    async onViewChange() {

    }

    async load(x: number, y: number) {
        if (!this.chunks[x] || !this.chunks[x]![y]) {
            if (!this.chunks[x]) {
                this.chunks[x] = [];
            }
            this.chunks[x]![y] = true;
            const geometry = await this.modelLoader.load(x * Constants.CHUNK_SIZE_PIXELS, y * Constants.CHUNK_SIZE_PIXELS);
            this.onGeometryLoad(geometry);
        }
    }
}