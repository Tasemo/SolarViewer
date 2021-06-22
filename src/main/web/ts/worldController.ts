import * as THREE from 'three';
import { Constants } from './constants';
import ModelLoader from './modelLoader';
import { Projections } from './projections';

class ChunkEntry {

    isLoading = true;
    mesh: THREE.Mesh | undefined;
}

export default class WorldController {

    private chunks: Array<Array<ChunkEntry | null>> = [[]];
    private chunkBounds: Array<Array<THREE.Mesh>> = [[]];
    private chunkBounds1D: Array<THREE.Mesh> = [];
    camera: THREE.Camera;
    scene: THREE.Scene;
    private material: THREE.Material;
    modelLoader: ModelLoader;
    private frustum = new THREE.Frustum();
    private raycaster = new THREE.Raycaster();

    constructor(camera: THREE.Camera, scene: THREE.Scene, material: THREE.Material, modelLoader: ModelLoader) {
        this.camera = camera;
        this.scene = scene;
        this.material = material;
        this.modelLoader = modelLoader;
        this.reload();
        camera.addEventListener("viewChange", this.onViewChange.bind(this));
    }

    reload() {
        this.generateChunkBounds();
        this.onViewChange();
    }

    /**
     * Generates approximations of the chunks which are used in intersection checks
     * with the camera frustum to determine which chunks are getting loaded. Disposes
     * existing bounds so it can be called multiple times.
     */
    private generateChunkBounds() {
        this.chunkBounds1D.length = 0;
        for (let z = 0; z < Constants.MOLA_CHUNKS_HEIGHT; z++) {
            for (let x = 0; x < Constants.MOLA_CHUNKS_WIDTH; x++) {
                if (!this.chunkBounds[z]) {
                    this.chunkBounds[z] = [];
                }
                const plane = this.generatePlane(x, z, Constants.MOLA_METER_PER_CHUNK, Constants.MOLA_METER_PER_CHUNK);
                this.chunkBounds[z]![x]?.geometry.dispose();
                this.chunkBounds[z]![x]! = new THREE.Mesh(plane);
                this.chunkBounds1D.push(this.chunkBounds[z]![x]!);
            }
        }
    }

    private generatePlane(x: number, z: number, width: number, height: number): THREE.BufferGeometry {
        const vertices: Array<number> = [];
        this.projected(new THREE.Vector3(x * width, 0, z * height), vertices);
        this.projected(new THREE.Vector3(x * width + width, 0, z * height), vertices);
        this.projected(new THREE.Vector3(x * width, 0, z * height + height), vertices);
        this.projected(new THREE.Vector3(x * width + width, 0, z * height + height), vertices);
        const indices = [0, 2, 1, 1, 2, 3]
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        return geometry;
    }

    private projected(vertex: THREE.Vector3, vertices?: number[]): THREE.Vector3 {
        const projected = this.modelLoader.projection.project(vertex, this.modelLoader.radius).divideScalar(Constants.METER_PER_GL_UNIT);
        if (vertices) {
            vertices.push(projected.x);
            vertices.push(projected.y);
            vertices.push(projected.z);
        }
        return projected;
    }

    private async onViewChange() {
        const cameraProjection = new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
        this.frustum.setFromProjectionMatrix(cameraProjection);
        const [chunksToLoad, chunkCount] = this.determineChunksToLoad();
        console.log("Visible: " + chunkCount);
        for (let z = 0; z < Constants.MOLA_CHUNKS_HEIGHT; z++) {
            for (let x = 0; x < Constants.MOLA_CHUNKS_WIDTH; x++) {
                if (this.chunks[z] && this.chunks[z]![x] && !(chunksToLoad[z] && chunksToLoad[z]![x])) {
                    this.dispose(x, z);
                }
            }
        }
        for (let z = 0; z < Constants.MOLA_CHUNKS_HEIGHT; z++) {
            for (let x = 0; x < Constants.MOLA_CHUNKS_WIDTH; x++) {
                if (chunksToLoad[z] && chunksToLoad[z]![x]) {
                    this.load(x, z);
                }
            }
        }
    }

    private determineChunksToLoad(): [Array<Array<boolean>>, number] {
        const result: Array<Array<boolean>> = [[]];
        let count = 0;
        for (let z = 0; z < Constants.MOLA_CHUNKS_HEIGHT; z++) {
            for (let x = 0; x < Constants.MOLA_CHUNKS_WIDTH; x++) {
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
            if (this.modelLoader.projection === Projections.FLAT) {
                return true;
            }
            return !this.isOccluded(currentChunk, xChunk, zChunk);
        }
        return false;
    }

    private isOccluded(currentChunk: THREE.Mesh, x: number, z: number): boolean {
        const direction = this.getMidPoint(x, z).sub(this.camera.position).normalize();
        this.raycaster.set(this.camera.position, direction);
        const intersections = this.raycaster.intersectObjects(this.chunkBounds1D);
        if (intersections.length === 0) {
            // most likely a rounding error, the ray in the direction of the point should always hit the point itself
            return false;
        }
        return intersections[0]!.object !== currentChunk;
    }

    private getMidPoint(xChunk: number, zChunk: number): THREE.Vector3 {
        const x = xChunk * Constants.MOLA_METER_PER_CHUNK + Constants.MOLA_METER_PER_CHUNK / 2;
        const z = zChunk * Constants.MOLA_METER_PER_CHUNK + Constants.MOLA_METER_PER_CHUNK / 2;
        return this.projected(new THREE.Vector3(x, 0, z));
    }

    /**
     * Loads the chunk at the specified position in chunk space and requests additional pixels
     * to connect neighboring chunks.
     * 
     * @param x the x position in chunk space
     * @param z the z position in chunk space
     */
    private async load(x: number, z: number) {
        if (!this.chunks[z] || !this.chunks[z]![x]) {
            if (!this.chunks[z]) {
                this.chunks[z] = [];
            }
            this.chunks[z]![x] = new ChunkEntry();
            let loadX = x * Constants.CHUNK_SIZE_PIXELS;
            let loadZ = z * Constants.CHUNK_SIZE_PIXELS;
            let loadWidth = Constants.CHUNK_SIZE_PIXELS;
            let loadHeight = Constants.CHUNK_SIZE_PIXELS;
            if (x !== 0) {
                loadX -= Constants.GLOBAL_STRIDE;
                loadWidth += Constants.GLOBAL_STRIDE;
            }
            if (z !== 0) {
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

    private dispose(x: number, z: number) {
        const chunk = this.chunks[z]![x]!;
        if (!chunk.isLoading) {
            this.scene.remove(chunk.mesh!)
            chunk.mesh!.geometry.dispose();
            this.chunks[z]![x] = null;
        }
    }
}