import * as THREE from 'three';
import {
    getDataTextBlock,
    getInfoBlock,
    updateCubePositionText,
    updateCubeRotationText
} from '../../../common/html_utils';
import {createCube, getPerspectiveCamera} from '../../../common/three_utils';
import {createTransformPanel} from '../../../common/panel_utils';

// === Сцена ===
const scene = new THREE.Scene();
const camera = getPerspectiveCamera(3);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const cube = createCube();
scene.add(cube);

// === Overlay для текста ===
const info = getInfoBlock()
const panel = createTransformPanel();
const autoRotate = panel.querySelector('#autoRotate') as HTMLInputElement;

document.body.appendChild(info);

// === Анимация ===
function animate() {
    requestAnimationFrame(animate);

    if (autoRotate.checked) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }

    // обновляем текст
    info.innerHTML = getDataTextBlock(cube.position, cube.rotation);
    cube.grabPositionTo(panel.positions);
    cube.grabRotationTo(panel.rotations);
    panel.updatePositions(panel.positions.x, panel.positions.y, panel.positions.z);
    panel.updateRotation(panel.rotations.x, panel.rotations.y, panel.rotations.z);

    renderer.render(scene, camera);
}

animate();

// === Resize ===
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Инициализация значениями из куба
function syncUIFromCube() {
    cube.grabPositionTo(panel.positions);
    cube.grabRotationTo(panel.rotations);
    panel.updatePositions?.(panel.positions.x, panel.positions.y, panel.positions.z);
    panel.updateRotation?.(panel.rotations.x, panel.rotations.y, panel.rotations.z);
}

syncUIFromCube();

// Обработчики: UI -> куб
[panel.positions.x, panel.positions.y, panel.positions.z].forEach((s) => {
    s.addEventListener('input', () => {
        updateCubePositionText(panel, cube.position);
    });
});


[panel.rotations.x, panel.rotations.y, panel.rotations.z].forEach((s) => {
    s.addEventListener('input', () => {
        updateCubeRotationText(panel, cube.rotation);
    });
});