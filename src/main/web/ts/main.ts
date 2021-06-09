import * as THREE from "three";
import ModelLoader from './modelLoader';

const METER_PER_PIXEL = 463.0835744;

let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera;

window.addEventListener("load", async () => {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const modelLoader = new ModelLoader();
    const geometry = await modelLoader.load("mola?x=0&y=0&width=100&height=100", METER_PER_PIXEL);
    const material = new THREE.ShaderMaterial({
        vertexShader: await (await fetch("shader/entityShader.vert")).text(),
        fragmentShader: await (await fetch("shader/entityShader.frag")).text()
    });
    scene.add(new THREE.Mesh(geometry, material));

    render();
});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})

function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
