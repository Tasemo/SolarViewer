import * as THREE from 'three';
import { Constants } from './constants';
import ModelLoader from './modelLoader';
import { FlatProjection} from './projections';

class ChunkEntry {

    public isLoading = true;
    public mesh: THREE.Mesh | undefined;
    public stride: number | undefined;
}

export default class WorldController {

    private readonly chunks: Array<Array<ChunkEntry | null>> = [[]];
    private chunkBounds: Array<Array<THREE.Mesh>> = [[]];
    private chunkBounds1D: Array<THREE.Mesh> = [];
    public readonly camera: THREE.Camera;
    public readonly scene: THREE.Scene;
    private readonly material: THREE.Material;
    public readonly modelLoader: ModelLoader;
    private readonly frustum = new THREE.Frustum();
    private readonly raycaster = new THREE.Raycaster();

    constructor(camera: THREE.Camera, scene: THREE.Scene, material: THREE.Material, modelLoader: ModelLoader) {
        this.camera = camera;
        this.scene = scene;
        this.material = material;
        this.modelLoader = modelLoader;
        this.reload();
        camera.addEventListener("viewChange", this.onViewChange.bind(this, false));
    }

    public reload() {
        this.generateChunkBounds();
        this.onViewChange(true);
    }

    /**
     * Generates approximations of the chunks which are used in intersection checks
     * with the camera frustum to determine which chunks are getting loaded. Disposes
     * existing bounds so it can be called multiple times.
     */
    private generateChunkBounds() {
        for (let z = 0; z < this.chunkBounds.length; z++) {
            for (let x = 0; x < this.chunkBounds[z]!.length; x++) {
                this.chunkBounds[z]![x]!.geometry.dispose();
            }
        }
        this.chunkBounds1D = [];
        this.chunkBounds = [[]];
        for (let z = 0; z < this.modelLoader.constants.chunkHeight; z++) {
            for (let x = 0; x < this.modelLoader.constants.chunkWidth; x++) {
                if (!this.chunkBounds[z]) {
                    this.chunkBounds[z] = [];
                }
                const plane = this.modelLoader.generatePlane(x, z);
                this.chunkBounds[z]![x]! = new THREE.Mesh(plane);
                this.chunkBounds1D.push(this.chunkBounds[z]![x]!);
            }
        }
    }

    private async onViewChange(forceDispose = false) {
        if (forceDispose) {
            for (let z = 0; z < this.chunks.length; z++) {
                for (let x = 0; this.chunks[z] && x < this.chunks[z]!.length; x++) {
                    if (this.chunks[z]![x]) {
                        this.dispose(x, z);
                    }
                }
            }
        }
        const cameraProjection = new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
        this.frustum.setFromProjectionMatrix(cameraProjection);
        const [chunksToLoad, chunkCount] = this.determineChunksToLoad();
        const stride = THREE.MathUtils.floorPowerOfTwo(chunkCount);
        for (let z = 0; z < this.modelLoader.constants.chunkHeight; z++) {
            for (let x = 0; x < this.modelLoader.constants.chunkWidth; x++) {
                if (this.chunks[z] && this.chunks[z]![x] && !(chunksToLoad[z] && chunksToLoad[z]![x])) {
                    this.dispose(x, z);
                }
            }
        }
        for (let z = 0; z < this.modelLoader.constants.chunkHeight; z++) {
            for (let x = 0; x < this.modelLoader.constants.chunkWidth; x++) {
                if (chunksToLoad[z] && chunksToLoad[z]![x]) {
                    this.load(x, z, stride);
                }
            }
        }
    }

    private determineChunksToLoad(): [Array<Array<boolean>>, number] {
        const result: Array<Array<boolean>> = [[]];
        let count = 0;
        for (let z = 0; z < this.modelLoader.constants.chunkHeight; z++) {
            for (let x = 0; x < this.modelLoader.constants.chunkWidth; x++) {
                if (this.isInCameraView(x, z)) {
                    if (!result[z]) {
                        result[z] = [];
                    }
                    result[z]![x] = true;
                    count++;
                }
            }
        }
        return [result, count];
    }

    private isInCameraView(xChunk: number, zChunk: number): boolean {
        const currentChunk = this.chunkBounds[zChunk]![xChunk]!
        if (this.frustum.intersectsObject(currentChunk)) {
            if (this.modelLoader.projection === FlatProjection.INSTANCE) {
                return true;
            }
            return !this.isOccluded(currentChunk, xChunk, zChunk);
        }
        return false;
    }

    private isOccluded(currentChunk: THREE.Mesh, x: number, z: number): boolean {
        const worldPosition = this.camera.getWorldPosition(new THREE.Vector3());
        const direction = this.modelLoader.getMidPoint(x, z).sub(worldPosition).normalize();
        this.raycaster.set(worldPosition, direction);
        const intersections = this.raycaster.intersectObjects(this.chunkBounds1D);
        if (intersections.length === 0) {
            // most likely a rounding error, the ray in the direction of the point should always hit the point itself
            return false;
        }
        return intersections[0]!.object !== currentChunk;
    }

    /**
     * Loads the chunk at the specified position in chunk space with the given stride and requests additional pixels
     * to connect neighboring chunks. If a chunk already exists at the place and a different stride is requested, the
     * existing chunk will be deleted.
     * 
     * @param x the x position in chunk space
     * @param z the z position in chunk space
     */
    private async load(x: number, z: number, stride: number) {
        if (!this.chunks[z]) {
            this.chunks[z] = [];
        }
        const existing = this.chunks[z]![x];
        if (existing?.isLoading || existing?.stride === stride) {
            return;
        }
        const chunk = new ChunkEntry();
        this.chunks[z]![x] = chunk;
        chunk.stride = stride;
        let loadX = x * Constants.CHUNK_SIZE_PIXELS;
        let loadZ = z * Constants.CHUNK_SIZE_PIXELS;
        let loadWidth = Constants.CHUNK_SIZE_PIXELS;
        let loadHeight = Constants.CHUNK_SIZE_PIXELS;
        if (x !== 0) {
            loadX -= stride;
            loadWidth += stride;
        }
        if (z !== 0) {
            loadZ -= stride;
            loadHeight += stride;
        }
        if (x === this.modelLoader.constants.chunkWidth - 1) {
            loadWidth += stride;
        }
        if (z === this.modelLoader.constants.chunkHeight - 1) {
            loadHeight += stride;
        }
        const geometry = await this.modelLoader.load(loadX, loadZ, loadWidth, loadHeight, stride);
        const mesh = new THREE.Mesh(geometry, this.material);
        chunk.mesh = mesh;
        if (existing) {
            existing.mesh!.geometry.dispose();
            this.scene.remove(existing.mesh!);
        }
        chunk.isLoading = false;
        this.scene.add(mesh);
    }

    private dispose(x: number, z: number) {
        const chunk = this.chunks[z]![x]!;
        if (!chunk.isLoading) {
            this.scene.remove(chunk.mesh!)
            chunk.mesh!.geometry.dispose();
            this.chunks[z]![x] = null;
        }
    }
}