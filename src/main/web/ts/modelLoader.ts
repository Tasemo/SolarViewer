import * as THREE from "three";
import { Constants } from "./constants";
import { Projection } from './projections';

export default class ModelLoader {

    private readonly baseUrl: string;
    private readonly meterPerPixel: number;
    public projection: Projection;
    public readonly radius: number;

    constructor(baseUrl: string, meterPerPixel: number, projection: Projection, radius: number) {
        this.baseUrl = baseUrl;
        this.meterPerPixel = meterPerPixel;
        this.projection = projection;
        this.radius = radius;
    }

    /**
     * Loads the elevation data at the specified position with the specified size and stride in pixel space from the server
     * and constructs a three dimensional indexed grid model with the current projection.
     *
     * @param xPixel the x position in pixel space
     * @param zPixel the z position in pixel space
     * @param width the width in pixel space
     * @param height the height in pixel space
     */
    public async load(xPixel: number, zPixel: number, width: number, height: number, stride: number): Promise<THREE.BufferGeometry> {
        const url = `${this.baseUrl}?x=${xPixel}&z=${zPixel}&stride=${stride}&width=${width}&height=${height}`;
        const elevationData: number[] = await (await fetch(url)).json()
        const vertices = new Float32Array(3 * elevationData.length);
        const dataWidth = width / stride;
        const dataHeight = height / stride;
        for (let i = 0; i < elevationData.length; i++) {
            const x = ((i % dataWidth) * stride + xPixel) * this.meterPerPixel;
            const z = (Math.floor(i / dataWidth) * stride + zPixel) * this.meterPerPixel;
            this.projected(new THREE.Vector3(x, elevationData[i], z), vertices, i * 3);
        }
        const indexLength = 6 * (dataWidth - 1) * (dataHeight - 1);
        const indices = vertices.length > 65535 ? new Uint32Array(indexLength) : new Uint16Array(indexLength);
        for (let z = 0; z < dataHeight - 1; z++) {
            for (let x = 0; x < dataWidth - 1; x++) {
                const topLeft = z * dataWidth + x;
                const topRight = topLeft + 1;
                const bottomLeft = (z + 1) * dataWidth + x;
                const bottomRight = bottomLeft + 1;
                const index = 6 * (z * (dataWidth - 1) + x);
                indices[index] = topLeft;
                indices[index + 1] = bottomLeft;
                indices[index + 2] = topRight;
                indices[index + 3] = topRight;
                indices[index + 4] = bottomLeft;
                indices[index + 5] = bottomRight;
            }
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        return geometry;
    }

    /**
     * Generates a plane fully stretching the dimensions of the chunk with just 4 vertices.
     * While it is projected using the current projection, the height of the chunk is not taken into account.
     * 
     * @param x the x position of the chunk in chunk space
     * @param z the z position of the chunk in chunk space
     */
    public generatePlane(x: number, z: number): THREE.BufferGeometry {
        const vertices = new Float32Array(12);
        this.projected(new THREE.Vector3(x * Constants.MOLA_METER_PER_CHUNK, 0, z * Constants.MOLA_METER_PER_CHUNK), vertices, 0);
        this.projected(new THREE.Vector3(x * Constants.MOLA_METER_PER_CHUNK + Constants.MOLA_METER_PER_CHUNK, 0, z * Constants.MOLA_METER_PER_CHUNK), vertices, 3);
        this.projected(new THREE.Vector3(x * Constants.MOLA_METER_PER_CHUNK, 0, z * Constants.MOLA_METER_PER_CHUNK + Constants.MOLA_METER_PER_CHUNK), vertices, 6);
        this.projected(new THREE.Vector3(x * Constants.MOLA_METER_PER_CHUNK + Constants.MOLA_METER_PER_CHUNK, 0, z * Constants.MOLA_METER_PER_CHUNK + Constants.MOLA_METER_PER_CHUNK), vertices, 9);
        const indices = new Uint16Array([0, 2, 1, 1, 2, 3]);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        return geometry;
    }

    /**
     * Calculates the midpoint of a chunk that was projected in the current projection.
     * 
     * @param x the x position of the chunk in chunk space
     * @param z the z position of the chunk in chunk space
     */
    public getMidPoint(xChunk: number, zChunk: number): THREE.Vector3 {
        const x = xChunk * Constants.MOLA_METER_PER_CHUNK + Constants.MOLA_METER_PER_CHUNK / 2;
        const z = zChunk * Constants.MOLA_METER_PER_CHUNK + Constants.MOLA_METER_PER_CHUNK / 2;
        return this.projected(new THREE.Vector3(x, 0, z));
    }

    private projected(vertex: THREE.Vector3, vertices?: Float32Array, index?: number): THREE.Vector3 {
        const projected = this.projection.project(vertex, this.radius).divideScalar(Constants.METER_PER_GL_UNIT);
        if (vertices) {
            vertices[index!] = projected.x;
            vertices[index! + 1] = projected.y;
            vertices[index! + 2] = projected.z;
        }
        return projected;
    }
}
