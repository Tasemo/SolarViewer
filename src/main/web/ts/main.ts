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
    cameraController = new CameraController(camera);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            "hueCutoff": { value: Constants.HUE_CUTOFF },
            "minHeight": { value: -8000 },
            "maxHeight": { value: 8000 }
        },
        vertexShader: await (await fetch("shader/topographyShader.vert")).text(),
        fragmentShader: await (await fetch("shader/topographyShader.frag")).text(),
        side: THREE.DoubleSide
    });
    const modelLoader = new ModelLoader("mola", Constants.MOLA_METER_PER_PIXEL, Projections.SPHERICAL, Constants.MOLA_RADIUS_METERS);
    const worldController = new WorldController(camera, scene, material, modelLoader, Constants.MOLA_PIXELS_PER_GL_UNIT);

    new InfoArea();
    new ConfigArea(worldController, material.uniforms["minHeight"]!, material.uniforms["maxHeight"]!);
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
