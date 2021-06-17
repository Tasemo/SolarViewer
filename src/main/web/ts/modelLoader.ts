import * as THREE from "three";
import { Constants } from "./constants";
import { Projection } from './projections';

export default class ModelLoader {

    private baseUrl: string;
    private meterPerPixel: number;
    projection: Projection;
    private radius: number;

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
    async load(xPixel: number, zPixel: number, width: number, height: number): Promise<THREE.BufferGeometry> {
        const url = `${this.baseUrl}?x=${xPixel}&z=${zPixel}&stride=${Constants.GLOBAL_STRIDE}&width=${width}&height=${height}`;
        const elevationData: number[] = await (await fetch(url)).json()
        const vertices: number[] = []
        const dataWidth = width / Constants.GLOBAL_STRIDE;
        const dataHeight = height / Constants.GLOBAL_STRIDE;
        for (let i = 0; i < elevationData.length; i++) {
            const x = ((i % dataWidth) * Constants.GLOBAL_STRIDE + xPixel) * this.meterPerPixel;
            const z = (Math.floor(i / dataWidth) * Constants.GLOBAL_STRIDE + zPixel) * this.meterPerPixel;
            const vertex = new THREE.Vector3(x, elevationData[i], z);
            const projected = this.projection.project(vertex, this.radius).divideScalar(Constants.METER_PER_GL_UNIT);
            vertices.push(projected.x);
            vertices.push(projected.y);
            vertices.push(projected.z);
        }
        const indices: number[] = []
        for (let z = 0; z < dataHeight - 1; z++) {
            for (let x = 0; x < dataWidth - 1; x++) {
                const topLeft = (z * dataWidth) + x;
                const topRight = topLeft + 1;
                const bottomLeft = ((z + 1) * dataWidth) + x;
                const bottomRight = bottomLeft + 1;
                indices.push(topLeft);
                indices.push(bottomLeft);
                indices.push(topRight);
                indices.push(topRight);
                indices.push(bottomLeft);
                indices.push(bottomRight);
            }
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute("height", new THREE.Float32BufferAttribute(elevationData, 1));
        geometry.setIndex(indices);
        return geometry;
    }
}
