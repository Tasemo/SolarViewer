import * as THREE from "three";
import ModelLoader from './modelLoader';
import { Constants, MolaConstants } from "./constants";
import WorldController from './worldController';
import { SphericalProjection } from "./projections";
import InfoArea from './ui/infoArea';
import ConfigArea from './ui/configArea';

let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera;
let configArea: ConfigArea, infoArea: InfoArea;
let lastTime = performance.now();

window.addEventListener("load", async () => {
    const constants = MolaConstants.INSTANCE;
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.translateZ(constants.radiusMeters * 1.5 / Constants.METER_PER_GL_UNIT)
    camera.updateMatrixWorld();

    const material = new THREE.ShaderMaterial({
        uniforms: {
            "hueCutoff": { value: Constants.HUE_CUTOFF },
            "radius": { value: constants.radiusMeters },
            "meterPerGLUnit": { value: Constants.METER_PER_GL_UNIT },
            "minHeight": { value: -4000 },
            "maxHeight": { value: 4000 },
            "projected": { value: true }
        },
        vertexShader: await (await fetch("shader/topographyShader.vert")).text(),
        fragmentShader: await (await fetch("shader/topographyShader.frag")).text(),
        side: THREE.DoubleSide
    });
    const modelLoader = new ModelLoader(constants, SphericalProjection.INSTANCE);
    const worldController = new WorldController(camera, scene, material, modelLoader);

    infoArea = new InfoArea(worldController);
    configArea = new ConfigArea(worldController, material.uniforms);
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
    configArea.currentCamera.update(delta);
    renderer.render(scene, camera);
    lastTime = currentTime;
    requestAnimationFrame(render);
}
