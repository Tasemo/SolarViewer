import * as THREE from 'three';

class SphericalProjection implements Projection {

    public project(vertex: THREE.Vector3, radius: number): THREE.Vector3 {
        const latLongAlt = Projections.FLAT.getLatLongAlt(vertex, radius);
        return this.toSphereVertex(latLongAlt.x, latLongAlt.y, radius + latLongAlt.z);
    }

    public unproject(vertex: THREE.Vector3, radius: number): THREE.Vector3 {
        const latLongAlt = this.getLatLongAlt(vertex, radius);
        return this.toUnprojectedVertex(latLongAlt.x, latLongAlt.y, latLongAlt.z, radius);
    }

    public getLatLongAlt(vertex: THREE.Vector3, radius: number) {
        const altitude = vertex.length() - radius;
        radius = radius + altitude;
        const latitude = Math.asin(-vertex.y / radius);
        const longitude = Math.atan2(vertex.x, vertex.z);
        return new THREE.Vector3(latitude, longitude, altitude);
    }

    private toSphereVertex(latitude: number, longitude: number, radius: number): THREE.Vector3 {
        const x = radius * Math.cos(latitude) * Math.sin(longitude);
        const y = -radius * Math.sin(latitude);
        const z = radius * Math.cos(latitude) * Math.cos(longitude);
        return new THREE.Vector3(x, y, z);
    }

    private toUnprojectedVertex(latitude: number, longitude: number, altitude: number, radius: number): THREE.Vector3 {
        radius = radius + altitude;
        const x = radius * (longitude - Math.PI);
        const z = radius * (latitude - Math.PI / 2);
        return new THREE.Vector3(x, altitude, z);
    }
}

class FlatProjection implements Projection {

    public project(vertex: THREE.Vector3, _: number) {
        return vertex;
    }

    public unproject(vertex: THREE.Vector3, _: number) {
        return vertex;
    }

    public getLatLongAlt(vertex: THREE.Vector3, radius: number) {
        const latitude = vertex.z / radius - Math.PI / 2;
        const longitude = vertex.x / radius - Math.PI;
        return new THREE.Vector3(latitude, longitude, vertex.y);
    }
}

export interface Projection {

    project(vertex: THREE.Vector3, radius: number): THREE.Vector3
    unproject(vertex: THREE.Vector3, radius: number): THREE.Vector3

    /**
     * Gets latitude, longitude and altitude from the given projected vertex. The units
     * of vertex and radius have to match (e.g meters or GL units). The radial unit is radians and 
     * the altitude is in the unit the provided data is in.
     * 
     * @param vertex the projected vertex
     * @param radius the radius of the sphere
     */
    getLatLongAlt(vertex: THREE.Vector3, radius: number): THREE.Vector3
}

/**
 * Contains a list of singletons of typical projections.
 */
export namespace Projections {

    export const SPHERICAL: Projection = new SphericalProjection();
    export const FLAT: Projection = new FlatProjection();
}