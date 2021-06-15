import * as THREE from 'three';

class SphericalProjection implements Projection {

    project(vertex: THREE.Vector3, radius: number): THREE.Vector3 {
        const latitude = vertex.z / radius - Math.PI / 2;
        const longitude = vertex.x / radius - Math.PI;
        return this.toSphereVertex(latitude, longitude, radius + vertex.y);
    }

    toSphereVertex(latitude: number, longitude: number, radius: number) {
        const x = radius * Math.cos(latitude) * Math.cos(longitude)
        const y = radius * Math.cos(latitude) * Math.sin(longitude)
        const z = radius * Math.sin(latitude)
        return new THREE.Vector3(x, y, z);
    }
}

class FlatProjection implements Projection {

    project(vertex: THREE.Vector3, _: number) {
        return vertex;
    }
}

export interface Projection {

    project(vertex: THREE.Vector3, radius: number): THREE.Vector3
}

export namespace Projections {

    export const SPHERICAL: Projection = new SphericalProjection();
    export const FLAT: Projection = new FlatProjection();
}