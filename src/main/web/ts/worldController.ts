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
        for (let z = 0; z < Constants.MOLA_CHUNKS_HEIGHT; z++) {
            for (let x = 0; x < Constants.MOLA_CHUNKS_WIDTH; x++) {
                this.load(x, z);
            }
        }
        camera.addEventListener("viewChange", this.onViewChange.bind(this));
    }

    async onViewChange() {
        
    }

    /**
     * Loads the chunk at the specified position in chunk space and requests additional pixels
     * if neighboring chunks have to be connected.
     * 
     * @param x the x position in chunk space
     * @param z the z position in chunk space
     */
    async load(x: number, z: number) {
        if (!this.chunks[z] || !this.chunks[z]![x]) {
            if (!this.chunks[z]) {
                this.chunks[z] = [];
            }
            this.chunks[z]![x] = true;
            let loadX = x * Constants.CHUNK_SIZE_PIXELS;
            let loadZ = z * Constants.CHUNK_SIZE_PIXELS;
            let loadWidth = Constants.CHUNK_SIZE_PIXELS;
            let loadHeight = Constants.CHUNK_SIZE_PIXELS;
            if (this.chunks[z]![x - 1]) {
                loadX -= Constants.GLOBAL_STRIDE;
                loadWidth += Constants.GLOBAL_STRIDE;
            }
            if (this.chunks[z - 1] && this.chunks[z - 1]![x]) {
                loadZ -= Constants.GLOBAL_STRIDE;
                loadHeight += Constants.GLOBAL_STRIDE;
            }
            const geometry = await this.modelLoader.load(loadX, loadZ, loadWidth, loadHeight);
            this.onGeometryLoad(geometry);
        }
    }
}