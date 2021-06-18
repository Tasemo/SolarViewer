import * as THREE from "three";
import { Constants } from '../constants';
import SliderElement from './sliderElement';
import WorldController from '../worldController';

function computeColors(steps: number): string {
    const colors = [];
    for (let i = 1; i <= steps; i++) {
        const hue = 360 * (Constants.HUE_CUTOFF - (Constants.HUE_CUTOFF / steps * i));
        colors[i - 1] = `hsl(${hue}, 100%, 50%)`
    }
    return colors.join(",");
}

export default class InfoArea extends SliderElement {

    private rayCaster = new THREE.Raycaster();
    private worldController: WorldController;
    private latitude: HTMLElement;
    private longitude: HTMLElement;
    private altitude: HTMLElement;

    constructor(worldController: WorldController) {
        super(document.querySelector("#infoArea")!)
        this.worldController = worldController;
        const heightScale: HTMLElement = document.querySelector("#heightScale")!;
        const color = "linear-gradient(to right," + computeColors(10) + ")";
        heightScale.style.background = color;
        this.latitude = document.querySelector("#latitude")!;
        this.longitude = document.querySelector("#longitude")!;
        this.altitude = document.querySelector("#altitude")!;
        window.addEventListener("click", this.raycast.bind(this));
    }

    raycast(event: MouseEvent) {
        const mouse = {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1
        }
        this.rayCaster.setFromCamera(mouse, this.worldController.camera);
        const intersections = this.rayCaster.intersectObjects(this.worldController.scene.children);
        if (intersections.length > 0) {
            const point = intersections[0]!.point.multiplyScalar(Constants.METER_PER_GL_UNIT);
            const projection = this.worldController.modelLoader.projection;
            const radius = this.worldController.modelLoader.radius;
            const latLongAlt = projection.getLatLongAlt(point, radius);
            if (latLongAlt.x > 0) {
                this.latitude.textContent = THREE.MathUtils.radToDeg(latLongAlt.x) + "° S";
            } else {
                this.latitude.textContent = -THREE.MathUtils.radToDeg(latLongAlt.x) + "° N";
            }
            if (latLongAlt.y > 0) {
                this.longitude.textContent = THREE.MathUtils.radToDeg(latLongAlt.y) + "° E";
            } else {
                this.longitude.textContent = -THREE.MathUtils.radToDeg(latLongAlt.y) + "° W";
            }
            this.altitude.textContent = latLongAlt.z + "m";
        }
    }
}