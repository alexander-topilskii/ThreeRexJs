import * as THREE from 'three';
import {
    getDataTextBlock,
    getInfoBlock,
    updateCubePositionText,
    updateCubeRotationText
} from '../../../common/html_utils';
import {createCube, getPerspectiveCamera} from '../../../common/three_utils';
import {OimoPhysics} from '../../../common/physics/OimoPhysics';
import {createTransformPanel} from '../../../common/panel_utils';
import {createGradientPlane, createGrid} from "../../../common/plane_helpers";
import {createPlayerController} from '../../../common/player_utils';

// === Сцена ===
const scene = new THREE.Scene();
const camera = getPerspectiveCamera(3);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Управление камерой: вынос в player_utils ---
const controller = createPlayerController(camera, renderer.domElement, {
    initialPosition: {x: 0, y: 2.5, z: 6},
    initialPitch: -0.35,
});
let prevTime = performance.now();

const cube = createCube();
scene.add(cube);

const ground = createGradientPlane(40, 40);
scene.add(ground);

const grid = createGrid(40, 40, ground.position)
scene.add(grid);

// Добавим невидимый box-коллайдер для ground (толщина 2.0, верх на уровне плоскости)
const groundCollider = new THREE.Mesh(
    new THREE.BoxGeometry(40, 2.0, 40),
    new THREE.MeshBasicMaterial({visible: false})
);
// Центр на 1.0 ниже верхней поверхности, чтобы верх совпадал с плоскостью ground
groundCollider.position.set(0, ground.position.y - 1.0, 0);
scene.add(groundCollider);

// === Физика (Oimo.js helper) ===
const physics = await OimoPhysics();
// ground — статический (mass = 0)
physics.addMesh(groundCollider, 0);
// cube — динамический (mass = 1)
physics.addMesh(cube, 1);


// === Overlay для текста ===
const info = getInfoBlock()
const panel = createTransformPanel();
const auto = panel.querySelector('#auto') as HTMLInputElement;

document.body.appendChild(info);

// === Анимация ===
function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt = (now - prevTime) / 1000;
    prevTime = now;

    // Обновляем контроллер камеры
    controller.update(dt);

    // Шаг физики только когда включен auto
    if (auto.checked && physics) {
        physics.step?.(dt);
    }

    // обновляем текст
    info.innerHTML = getDataTextBlock(cube.position, cube.rotation);
    syncUIFromCube();

    renderer.render(scene, camera);
}

animate();

// Очистка обработчиков при выгрузке страницы
window.addEventListener('beforeunload', () => controller.dispose());

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
    panel.updatePositions(panel.positions);
    panel.updateRotation(panel.rotations);
}

syncUIFromCube();

// Обработчики: UI -> куб
[panel.positions.x, panel.positions.y, panel.positions.z].forEach((s) => {
    s.addEventListener('input', () => {
        updateCubePositionText(panel, cube.position);
        physics.updateMesh?.(cube);
    });
});


[panel.rotations.x, panel.rotations.y, panel.rotations.z].forEach((s) => {
    s.addEventListener('input', () => {
        updateCubeRotationText(panel, cube.rotation);
        physics.updateMesh?.(cube);
    });
});//d