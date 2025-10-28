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
import {Player} from '../../../common/Player';

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

// Добавим стенки по краям (полупрозрачные)
const wallMaterial = new THREE.MeshBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.3
});
const wallHeight = 2;
const wallThickness = 0.5;
const groundSize = 40;

// Северная стенка
const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(groundSize, wallHeight, wallThickness), wallMaterial);
wallNorth.position.set(0, wallHeight / 2, -groundSize / 2);
scene.add(wallNorth);

// Южная стенка
const wallSouth = new THREE.Mesh(new THREE.BoxGeometry(groundSize, wallHeight, wallThickness), wallMaterial);
wallSouth.position.set(0, wallHeight / 2, groundSize / 2);
scene.add(wallSouth);

// Западная стенка
const wallWest = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, groundSize), wallMaterial);
wallWest.position.set(-groundSize / 2, wallHeight / 2, 0);
scene.add(wallWest);

// Восточная стенка
const wallEast = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, groundSize), wallMaterial);
wallEast.position.set(groundSize / 2, wallHeight / 2, 0);
scene.add(wallEast);

// === Физика (Oimo.js helper) ===
const physics = await OimoPhysics();
// ground — статический (mass = 0)
physics.addMesh(groundCollider, 0);
// стенки — статические
physics.addMesh(wallNorth, 0);
physics.addMesh(wallSouth, 0);
physics.addMesh(wallWest, 0);
physics.addMesh(wallEast, 0);
// cube — динамический (mass = 1)
physics.addMesh(cube, 1);

// === Игрок ===
const player = new Player(physics, {
    position: { x: 5, y: 1, z: 5 },
    speed: 5,
    jumpForce: 8
});
scene.add(player.mesh);

// Управление режимами (Shift для переключения)
let playerMode = false;
window.addEventListener('keydown', (e) => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        playerMode = true;
        controller.enabled = false;
    }
});
window.addEventListener('keyup', (e) => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        playerMode = false;
        controller.enabled = true;
    }
});


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

    // Обновляем контроллер камеры (только если не в режиме игрока)
    if (!playerMode) {
        controller.update(dt);
    }

    // Обновляем игрока (только в режиме игрока)
    if (playerMode) {
        player.update(dt, camera);
    }

    // Проверяем близость к кубу для подбора
    const distToCube = player.getPosition().distanceTo(cube.position);
    if (distToCube < 3) {
        player.setNearbyPickupTarget(cube);
    } else {
        player.setNearbyPickupTarget(null);
    }

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
window.addEventListener('beforeunload', () => {
    controller.dispose();
    player.dispose();
});

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