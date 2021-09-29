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

function round(number: number, decimals = 0): number {
    return Number(Math.round(Number(number + "e" + decimals)) + "e-" + decimals);
}

export default class InfoArea extends SliderElement {

    private readonly rayCaster = new THREE.Raycaster();
    private readonly worldController: WorldController;
    private readonly latitude: HTMLElement;
    private readonly longitude: HTMLElement;
    private readonly altitude: HTMLElement;
    private readonly viewingHeight: HTMLElement;

    constructor(worldController: WorldController) {
        super(document.querySelector("#infoArea")!)
        this.worldController = worldController;
        const heightScale: HTMLElement = document.querySelector("#heightScale")!;
        const color = "linear-gradient(to right," + computeColors(10) + ")";
        heightScale.style.background = color;
        this.latitude = document.querySelector("#latitude")!;
        this.longitude = document.querySelector("#longitude")!;
        this.altitude = document.querySelector("#altitude")!;
        this.viewingHeight = document.querySelector("#viewingHeight")!;
        window.addEventListener("click", this.raycast.bind(this));
        worldController.camera.addEventListener("viewChange", this.onViewChange.bind(this));
        this.onViewChange();
    }

    private onViewChange() {
        const height = this.worldController.camera.position.length() * Constants.METER_PER_GL_UNIT - this.worldController.modelLoader.constants.radiusMeters;
        this.viewingHeight.textContent = round(height / 1000) + "km";
    }

    private raycast(event: MouseEvent) {
        const mouse = {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1
        }
        this.rayCaster.setFromCamera(mouse, this.worldController.camera);
        const intersections = this.rayCaster.intersectObjects(this.worldController.scene.children);
        if (intersections.length > 0) {
            const point = intersections[0]!.point.multiplyScalar(Constants.METER_PER_GL_UNIT);
            const projection = this.worldController.modelLoader.projection;
            const radius = this.worldController.modelLoader.constants.radiusMeters;
            const latLongAlt = projection.getLatLongAlt(point, radius);
            if (latLongAlt.x > 0) {
                this.latitude.textContent = round(THREE.MathUtils.radToDeg(latLongAlt.x), 1) + "° S";
            } else {
                this.latitude.textContent = -round(THREE.MathUtils.radToDeg(latLongAlt.x), 1) + "° N";
            }
            if (latLongAlt.y > 0) {
                this.longitude.textContent = round(THREE.MathUtils.radToDeg(latLongAlt.y), 1) + "° E";
            } else {
                this.longitude.textContent = -round(THREE.MathUtils.radToDeg(latLongAlt.y), 1) + "° W";
            }
            this.altitude.textContent = round(latLongAlt.z) + "m";
        }
    }
}