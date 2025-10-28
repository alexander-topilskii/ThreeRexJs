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
import {ControlPanel} from '../../../common/ui/ControlPanel';
import {createWalls, createGroundCollider, createGoalSphere, isInsideSphere} from '../../../common/scene_setup';
import {addStaticMeshes, addDynamicMesh, checkDistance} from '../../../common/physics_setup';
import {ConfettiSystem} from '../../../common/effects/Confetti';

// === Константы ===
const GROUND_SIZE = 40;
const WALL_HEIGHT = 2;
const PICKUP_DISTANCE = 3;
const CUBE_SIZE = 1; // Размер куба из createCube()

// === Сцена ===
const scene = new THREE.Scene();
const camera = getPerspectiveCamera(3);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Камера ===
const controller = createPlayerController(camera, renderer.domElement, {
    initialPosition: {x: 0, y: 2.5, z: 6},
    initialPitch: -0.35,
});

// === Объекты сцены ===
const cube = createCube();
scene.add(cube);

const ground = createGradientPlane(GROUND_SIZE, GROUND_SIZE);
scene.add(ground);

const grid = createGrid(GROUND_SIZE, GROUND_SIZE, ground.position);
scene.add(grid);

const groundCollider = createGroundCollider(GROUND_SIZE, 2.0, ground.position.y);
scene.add(groundCollider);

const walls = createWalls({
    size: GROUND_SIZE,
    height: WALL_HEIGHT,
    thickness: 2.0,
    color: 0x4488ff,
    opacity: 0.3,
    groundY: ground.position.y
});
walls.forEach(wall => scene.add(wall));

// Сфера-цель (радиус = 2 ширины куба)
const goalSphereRadius = CUBE_SIZE * 2;
const goalSphere = createGoalSphere({
    radius: goalSphereRadius,
    position: { x: -10, y: ground.position.y, z: -10 },
    color: 0xffff00,
    opacity: 0.3
});
scene.add(goalSphere);

// === Физика ===
const physics = await OimoPhysics();
addStaticMeshes(physics, [groundCollider, ...walls]);
addDynamicMesh(physics, cube, 1);

// === Игрок ===
const player = new Player(physics, {
    position: { x: 5, y: 1, z: 5 },
    speed: 5,
    jumpForce: 8
});
scene.add(player.mesh);

// === Эффекты ===
const confetti = new ConfettiSystem(scene);

// === UI ===
const controlPanel = new ControlPanel(player, {
    onCommand: (cmd) => console.log('Команда:', cmd)
});
controlPanel.mount();

const info = getInfoBlock();
const panel = createTransformPanel();
const auto = panel.querySelector('#auto') as HTMLInputElement;
document.body.appendChild(info);

// === Обработчики панели куба ===
function syncUIFromCube() {
    cube.grabPositionTo(panel.positions);
    cube.grabRotationTo(panel.rotations);
    panel.updatePositions(panel.positions);
    panel.updateRotation(panel.rotations);
}

syncUIFromCube();

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
});

// === Игровой цикл ===
let prevTime = performance.now();
let gameWon = false;

function updatePlayerStatus() {
    const distToCube = checkDistance(player.mesh, cube);
    const cubePos = cube.position;
    const spherePos = goalSphere.position;

    // Проверяем победу
    if (!gameWon && isInsideSphere(cube, goalSphere, goalSphereRadius)) {
        gameWon = true;
        controlPanel.setOutput('🎉 ВЫ ПОБЕДИЛИ! 🎉');

        // Запускаем конфетти из позиции сферы
        confetti.burst(goalSphere.position.clone(), 150);
        return;
    }

    // Формируем вывод статуса
    let output = '';

    // Позиции объектов
    output += `Куб: x=${cubePos.x.toFixed(1)}, y=${cubePos.y.toFixed(1)}, z=${cubePos.z.toFixed(1)}\n`;
    output += `Сфера: x=${spherePos.x.toFixed(1)}, y=${spherePos.y.toFixed(1)}, z=${spherePos.z.toFixed(1)}\n`;

    // Обновляем кнопку взять/отпустить
    controlPanel.updatePickupButton(player.isCarrying);

    // Статус робота
    if (player.isCarrying) {
        // Если держим куб
        output += `Вы держите куб (дистанция: ${distToCube.toFixed(2)}). Нажмите "Отпустить"`;
    } else if (distToCube < PICKUP_DISTANCE) {
        // Если рядом с кубом
        player.setNearbyPickupTarget(cube);
        output += `Рядом с кубом (дистанция: ${distToCube.toFixed(2)}). Нажмите "Взять"`;
    } else {
        // Просто показываем позицию робота
        player.setNearbyPickupTarget(null);
        const pos = player.getPosition();
        output += `Робот: x=${pos.x.toFixed(1)}, y=${pos.y.toFixed(1)}, z=${pos.z.toFixed(1)}`;
    }

    controlPanel.setOutput(output);
}

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt = (now - prevTime) / 1000;
    prevTime = now;

    controller.update(dt);
    player.update(dt);
    updatePlayerStatus();

    // Обновляем систему конфетти
    confetti.update(dt);

    if (auto.checked) {
        physics.step?.(dt);
    }

    info.innerHTML = getDataTextBlock(cube.position, cube.rotation);
    syncUIFromCube();

    renderer.render(scene, camera);
}

animate();

// === Очистка ===
window.addEventListener('beforeunload', () => {
    controller.dispose();
    player.dispose();
    controlPanel.dispose();
    confetti.clear();
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
