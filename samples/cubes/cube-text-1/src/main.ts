import * as THREE from 'three';
import { getDataTextBlock, getInfoBlock } from '../../../common/html_utils';
import { getPerspectiveCamera } from '../../../common/three/three_utils';
import {createCube} from "../../../common/three/box_utils";

// === Сцена ===
const scene = new THREE.Scene();
const camera = getPerspectiveCamera();

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Объект ===
const cube = createCube();
scene.add(cube);

// === Overlay для текста ===
const info = getInfoBlock()

document.body.appendChild(info);

// === Анимация ===
function animate() {
    requestAnimationFrame(animate);

    // вращение куба
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // обновляем текст
    info.innerHTML = getDataTextBlock(cube.position, cube.rotation)

    renderer.render(scene, camera);
}

animate();

// === Resize ===
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});