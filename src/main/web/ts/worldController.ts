import * as THREE from 'three';
import { Constants } from './constants';
import ModelLoader from './modelLoader';

class ChunkEntry {

    isLoading = true;
    mesh: THREE.Mesh | undefined;
}

export default class WorldController {

    private chunks: Array<Array<ChunkEntry|null>> = [[]];
    private camera: THREE.Camera;
    private scene: THREE.Scene;
    private material: THREE.Material;
    modelLoader: ModelLoader;
    private pixelsPerGLUnit: number;

    constructor(camera: THREE.Camera, scene: THREE.Scene, material: THREE.Material, modelLoader: ModelLoader, pixelsPerGLUnit: number) {
        this.camera = camera;
        this.scene = scene;
        this.material = material;
        this.modelLoader = modelLoader;
        this.pixelsPerGLUnit = pixelsPerGLUnit;
        for (let z = 0; z < Constants.MOLA_CHUNKS_HEIGHT; z++) {
            for (let x = 0; x < Constants.MOLA_CHUNKS_WIDTH; x++) {
                this.load(x, z);
            }
        }
        camera.addEventListener("viewChange", this.onViewChange.bind(this));
    }

    reload() {
        for (let z = 0; z < Constants.MOLA_CHUNKS_HEIGHT; z++) {
            for (let x = 0; x < Constants.MOLA_CHUNKS_WIDTH; x++) {
                if (this.chunks[z] && this.chunks[z]![x]) {
                    this.dispose(x, z);
                    this.load(x, z);
                }
            }
        }
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
            this.chunks[z]![x] = new ChunkEntry();
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
            if (x === Constants.MOLA_CHUNKS_WIDTH - 1) {
                loadWidth += Constants.GLOBAL_STRIDE;
            }
            const geometry = await this.modelLoader.load(loadX, loadZ, loadWidth, loadHeight);
            const mesh = new THREE.Mesh(geometry, this.material)
            this.chunks[z]![x]!.mesh = mesh;
            this.chunks[z]![x]!.isLoading = false;
            this.scene.add(mesh);
        }
    }

    dispose(x: number, z: number) {
        const chunk = this.chunks[z]![x]!;
        if (!chunk.isLoading) {
            this.scene.remove(chunk.mesh!)
            chunk.mesh!.geometry.dispose();
            this.chunks[z]![x] = null;
        }
    }
}