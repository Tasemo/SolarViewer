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
    camera: THREE.Camera;
    scene: THREE.Scene;
    private material: THREE.Material;
    modelLoader: ModelLoader;
    private pixelsPerGLUnit: number;
    private frustum = new THREE.Frustum();
    private closestChunkDistance = Infinity;

    constructor(camera: THREE.Camera, scene: THREE.Scene, material: THREE.Material, modelLoader: ModelLoader, pixelsPerGLUnit: number) {
        this.camera = camera;
        this.scene = scene;
        this.material = material;
        this.modelLoader = modelLoader;
        this.pixelsPerGLUnit = pixelsPerGLUnit;
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
        for (let z = 0; z < Constants.MOLA_CHUNKS_HEIGHT; z++) {
            for (let x = 0; x < Constants.MOLA_CHUNKS_WIDTH; x++) {
                if (!this.chunkBounds[z]) {
                    this.chunkBounds[z] = [];
                }
                const plane = this.generatePlane(x, z, Constants.MOLA_METER_PER_CHUNK, Constants.MOLA_METER_PER_CHUNK);
                const existing = this.chunkBounds[z]![x];
                if (existing) {
                    existing.geometry.dispose();
                }
                this.chunkBounds[z]![x]! = new THREE.Mesh(plane);
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

    private getMidPoint(xChunk: number, zChunk: number): THREE.Vector3 {
        const x = xChunk * Constants.MOLA_METER_PER_CHUNK + Constants.MOLA_METER_PER_CHUNK / 2;
        const z = zChunk * Constants.MOLA_METER_PER_CHUNK + Constants.MOLA_METER_PER_CHUNK / 2;
        return this.projected(new THREE.Vector3(x, 0, z));
    }

    private async onViewChange() {
        const cameraProjection = new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
        this.frustum.setFromProjectionMatrix(cameraProjection);
        if (this.modelLoader.projection !== Projections.FLAT) {
            this.closestChunkDistance = Infinity;
            for (let z = 0; z < Constants.MOLA_CHUNKS_HEIGHT; z++) {
                for (let x = 0; x < Constants.MOLA_CHUNKS_WIDTH; x++) {
                    const distance = this.getMidPoint(x, z).distanceTo(this.camera.position);
                    if (distance < this.closestChunkDistance) {
                        this.closestChunkDistance = distance;
                    }
                }
            }
        }
        const chunksToLoad: Array<Array<boolean>> = [[]];
        for (let z = 0; z < Constants.MOLA_CHUNKS_HEIGHT; z++) {
            for (let x = 0; x < Constants.MOLA_CHUNKS_WIDTH; x++) {
                if (this.isInCameraView(x, z)) {
                    if (!chunksToLoad[z]) {
                        chunksToLoad[z] = [];
                    }
                    chunksToLoad[z]![x] = true;
                }
            }
        }
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

    private isInCameraView(xChunk: number, zChunk: number): boolean {
        const currentChunk = this.chunkBounds[zChunk]![xChunk]!
        if (this.frustum.intersectsObject(currentChunk)) {
            // no occlusion check needed for a flat map
            if (this.modelLoader.projection === Projections.FLAT) {
                return true;
            }
            // since raycasts are too expensive, just check that the distance between the camera and 
            // chunk are less than distance from camera to closest chunk plus the radius
            const midPoint = this.getMidPoint(xChunk, zChunk);
            return midPoint.distanceTo(this.camera.position) < this.closestChunkDistance + Constants.MOLA_RADIUS_GL_UNITS;
        }
        return false;
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