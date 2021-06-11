import * as THREE from "three";

export default class ModelLoader {

    async load(url: string, sizePerPoint: number, globalScale: number): Promise<THREE.BufferGeometry> {
        const rawData: number[] = await (await fetch(url)).json()
        const vertices = [rawData.length * 3]
        const vertexCountEdge = Math.sqrt(rawData.length);
        let vertexCounter = 0;
        for (let i = 0; i < rawData.length; i++) {
            const x = i % vertexCountEdge;
            const z = i / vertexCountEdge;
            vertices[vertexCounter++] = x * sizePerPoint / globalScale;
            vertices[vertexCounter++] = rawData[i]! / globalScale;
            vertices[vertexCounter++] = z * sizePerPoint / globalScale;
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
        geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        return geometry;
    }
}
