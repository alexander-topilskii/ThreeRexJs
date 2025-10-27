import * as THREE from 'three';
import Stats from 'stats.js';

// === Сцена ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === FPS Stats ===
const stats = new Stats();
stats.showPanel(0); // 0: FPS, 1: ms, 2: mb
document.body.appendChild(stats.dom);

// === Объект ===
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// === Анимация ===
function animate() {
    stats.begin();

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);

    stats.end();
    requestAnimationFrame(animate);
}

animate();

// === Resize ===
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});