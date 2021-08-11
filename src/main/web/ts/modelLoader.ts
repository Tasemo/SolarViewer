import * as THREE from "three";
import { Constants } from "./constants";
import { Projection } from './projections';

const SHORT_MIN_VALUE = -32768;
const UNSIGNED_SHORT_MAX_VALUE = 65535;

export default class ModelLoader {

    private baseUrl: string;
    private meterPerPixel: number;
    projection: Projection;
    radius: number;

    constructor(baseUrl: string, meterPerPixel: number, projection: Projection, radius: number) {
        this.baseUrl = baseUrl;
        this.meterPerPixel = meterPerPixel;
        this.projection = projection;
        this.radius = radius;
    }

    /**
     * Loads the elevation data at the specified position with the specified size in pixel space from the server
     * and constructs a three dimensional indexed grid model.
     * 
     * @param xPixel the x position in pixel space
     * @param zPixel the z position in pixel space
     * @param width the width in pixel space
     * @param height the height in pixel space
     */
    async load(xPixel: number, zPixel: number, width: number, height: number, stride: number): Promise<THREE.BufferGeometry> {
        const url = `${this.baseUrl}?x=${xPixel}&z=${zPixel}&stride=${stride}&width=${width}&height=${height}`;
        const elevationData: number[] = await (await fetch(url)).json();
        const vertices = new Float32Array(3 * elevationData.length);
        const dataWidth = width / stride;
        const dataHeight = height / stride;
        for (let i = 0; i < elevationData.length; i++) {
            const x = ((i % dataWidth) * stride + xPixel) * this.meterPerPixel;
            const z = (Math.floor(i / dataWidth) * stride + zPixel) * this.meterPerPixel;
            this.projected(new THREE.Vector3(x, elevationData[i], z), vertices, i * 3);
        }
        const indices = []; // unable to use a typed array since the size is not known
        for (let z = 0; z < dataHeight - 1; z++) {
            for (let x = 0; x < dataWidth - 1; x++) {
                const topLeft = z * dataWidth + x;
                let topRight = topLeft + 1;
                let bottomLeft = (z + 1) * dataWidth + x;
                const bottomRight = bottomLeft + 1;
                if (elevationData[topLeft] === SHORT_MIN_VALUE || elevationData[bottomLeft] === SHORT_MIN_VALUE || elevationData[topRight] === SHORT_MIN_VALUE) {
                    continue;
                }
                for (let i = 0, bottomRightPointer = bottomRight; i < dataWidth - 2 && elevationData[bottomRightPointer] === SHORT_MIN_VALUE; i++) {
                    topRight++;
                    bottomRightPointer = bottomLeft + topRight;
                }
                for (let i = 0, bottomRightPointer = bottomRight; i < dataWidth - 1 && elevationData[bottomRightPointer] === SHORT_MIN_VALUE; i++) {
                    bottomLeft = (z + 1 + i) * dataWidth + x;
                    bottomRightPointer = bottomLeft + 1;
                }
                indices.push(topLeft);
                indices.push(bottomLeft);
                indices.push(topRight);
                indices.push(topRight);
                indices.push(bottomLeft);
                indices.push(bottomLeft + topRight);
            }
        }
        // remove the marked vertices after the correct indices were computed
        const finalVertices: Float32Array = vertices.filter((_, index) => {
            return elevationData[Math.floor(index / 3)] !== SHORT_MIN_VALUE;
        });
        const finalIndices = vertices.length > UNSIGNED_SHORT_MAX_VALUE ? new Uint32Array(indices) : new Uint16Array(indices);
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(finalVertices, 3));
        geometry.setIndex(new THREE.BufferAttribute(finalIndices, 1));
        return geometry;
    }

    generatePlane(x: number, z: number): THREE.BufferGeometry {
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

    getMidPoint(xChunk: number, zChunk: number): THREE.Vector3 {
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
