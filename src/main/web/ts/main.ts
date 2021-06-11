import * as THREE from "three";
import ModelLoader from './modelLoader';
import CameraController from './cameraController';
import { Constants } from "./constants";
import WorldController from './worldController';

let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera;
let cameraController: CameraController;
let lastTime = performance.now();

window.addEventListener("load", async () => {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraController = new CameraController(camera);

    scene.add(new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial( { color: 0xff0000ff })));

    const material = new THREE.ShaderMaterial({
        vertexShader: await (await fetch("shader/entityShader.vert")).text(),
        fragmentShader: await (await fetch("shader/entityShader.frag")).text()
    });
    const onGeometryLoad = (geometry: THREE.BufferGeometry) => scene.add(new THREE.Mesh(geometry, material));
    const modelLoader = new ModelLoader("mola", Constants.MOLA_METER_PER_PIXEL);
    new WorldController(camera, modelLoader, Constants.MOLA_PIXELS_PER_GL_UNIT, onGeometryLoad);

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
