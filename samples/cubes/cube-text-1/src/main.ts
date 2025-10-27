import * as THREE from 'three';
import {Euler, Object3D, Vector2, Vector3} from "three";

// === Сцена ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Объект ===
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// === Overlay для текста ===
const info = getInfoBlock()

function getInfoBlock() {
    const info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.left = '10px';
    info.style.color = 'white';
    info.style.fontFamily = 'monospace';
    info.style.background = 'rgba(0, 0, 0, 0.5)';
    info.style.padding = '6px 8px';
    info.style.borderRadius = '4px';
    return info
}

function getDataTextBlock(cubePosition: Vector3, cubeRotation: Euler) {
    return `pos: x=${cubePosition.x.toFixed(2)}, y=${cubePosition.y.toFixed(2)}, z=${cubePosition.z.toFixed(2)}<br>` +
        `rot: x=${cubeRotation.x.toFixed(2)}, y=${cubeRotation.y.toFixed(2)}, z=${cubeRotation.z.toFixed(2)}`;
}

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