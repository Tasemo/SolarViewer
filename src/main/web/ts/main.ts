import * as THREE from "three";
import ModelLoader from './modelLoader';
import CameraController from './cameraController';
import { Constants } from "./constants";
import WorldController from './worldController';
import { Projections } from "./projections";
import InfoArea from './ui/infoArea';
import ConfigArea from './ui/configArea';

let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera;
let cameraController: CameraController;
let lastTime = performance.now();

window.addEventListener("load", async () => {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.rotateY(Math.PI);
    cameraController = new CameraController(camera);

    const material = new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        vertexShader: await (await fetch("shader/entityShader.vert")).text(),
        fragmentShader: await (await fetch("shader/entityShader.frag")).text()
    });
    const onGeometryLoad = (geometry: THREE.BufferGeometry) => scene.add(new THREE.Mesh(geometry, material));
    const modelLoader = new ModelLoader("mola", Constants.MOLA_METER_PER_PIXEL, Projections.SPHERICAL, Constants.MOLA_RADIUS_METERS);
    new WorldController(camera, modelLoader, Constants.MOLA_PIXELS_PER_GL_UNIT, onGeometryLoad);
    new InfoArea();
    new ConfigArea();

    render();
});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

function render() {
    const currentTime = performance.now();
    const delta = (currentTime - lastTime) / 1000;
    cameraController.update(delta);
    renderer.render(scene, camera);
    lastTime = currentTime;
    requestAnimationFrame(render);
}
