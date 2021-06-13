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
     * Loads the elevation data at the specified position with the specified size in pixel space from the server
     * and constructs a three dimensional indexed grid model.
     * 
     * @param xPixel the x position in pixel space
     * @param zPixel the z position in pixel space
     * @param width the width in pixel space
     * @param height the height in pixel space
     */
    async load(xPixel: number, zPixel: number, width: number, height: number): Promise<THREE.BufferGeometry> {
        const url = `${this.baseUrl}?x=${xPixel}&z=${zPixel}&stride=${Constants.GLOBAL_STRIDE}&width=${width}&height=${height}`;
        const elevationData: number[] = await (await fetch(url)).json()
        const vertices = [elevationData.length * 3];
        const dataWidth = width / Constants.GLOBAL_STRIDE;
        const dataHeight = height / Constants.GLOBAL_STRIDE;
        let vertexCounter = 0;
        for (let i = 0; i < elevationData.length; i++) {
            const x = (i % dataWidth) * Constants.GLOBAL_STRIDE + xPixel;
            const z = Math.floor(i / dataHeight) * Constants.GLOBAL_STRIDE + zPixel;
            vertices[vertexCounter++] = x * this.meterPerPixel / Constants.METER_PER_GL_UNIT;
            vertices[vertexCounter++] = elevationData[i]! / Constants.METER_PER_GL_UNIT;
            vertices[vertexCounter++] = z * this.meterPerPixel / Constants.METER_PER_GL_UNIT;
        }
        const indices = [6 * (dataWidth - 1) * (dataHeight - 1)];
        let indexCounter = 0;
        for (let z = 0; z < dataHeight - 1; z++) {
            for (let x = 0; x < dataWidth - 1; x++) {
                const topLeft = (z * dataWidth) + x;
                const topRight = topLeft + 1;
                const bottomLeft = ((z + 1) * dataWidth) + x;
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
