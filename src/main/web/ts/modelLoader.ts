import * as THREE from "three";
import { Constants } from "./constants";

export default class ModelLoader {

    private baseUrl: string;
    private meterPerPixel: number;

    constructor(baseUrl: string, meterPerPixel: number) {
        this.baseUrl = baseUrl;
        this.meterPerPixel = meterPerPixel;
    }

    /**
     * Loads the elevation data at the specified position in pixel space from the server
     * and constructs a three dimensional grid model.
     * 
     * @param xPixel the x position in pixel space
     * @param zPixel the z position in pixel space
     */
    async load(xPixel: number, zPixel: number): Promise<THREE.BufferGeometry> {
        const url = `${this.baseUrl}?x=${xPixel}&z=${zPixel}&stride=${Constants.GLOBAL_STRIDE}&width=${Constants.CHUNK_SIZE_PIXELS}&height=${Constants.CHUNK_SIZE_PIXELS}`;
        const rawData: number[] = await (await fetch(url)).json()
        const vertices = [rawData.length * 3]
        const vertexCountEdge = Math.sqrt(rawData.length);
        let vertexCounter = 0;
        for (let i = 0; i < rawData.length; i++) {  
            const x = (i % vertexCountEdge) * Constants.GLOBAL_STRIDE + xPixel;
            const z = (i / vertexCountEdge) * Constants.GLOBAL_STRIDE + zPixel;
            vertices[vertexCounter++] = x * this.meterPerPixel / Constants.METER_PER_GL_UNIT;
            vertices[vertexCounter++] = rawData[i]! / Constants.METER_PER_GL_UNIT;
            vertices[vertexCounter++] = z * this.meterPerPixel / Constants.METER_PER_GL_UNIT;
        }
        const indices = [6 * (vertexCountEdge - 1) * (vertexCountEdge - 1)];
        let indexCounter = 0;
        for (let z = 0; z < vertexCountEdge - 1; z++) {
            for (let x = 0; x < vertexCountEdge - 1; x++) {
                const topLeft = (z * vertexCountEdge) + x;
                const topRight = topLeft + 1;
                const bottomLeft = ((z + 1) * vertexCountEdge) + x;
                const bottomRight = bottomLeft + 1;
                indices[indexCounter++] = topLeft;
                indices[indexCounter++] = bottomLeft;
                indices[indexCounter++] = topRight;
                indices[indexCounter++] = topRight;
                indices[indexCounter++] = bottomLeft;
                indices[indexCounter++] = bottomRight;
            }
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        return geometry;
    }
}
