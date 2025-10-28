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

// === Панель управления роботом ===
const controlPanel = document.createElement('div');
controlPanel.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    padding: 20px;
    display: flex;
    gap: 20px;
    align-items: center;
    color: white;
    font-family: monospace;
    z-index: 1000;
    resize: vertical;
    overflow: auto;
    min-height: 100px;
    max-height: 50vh;
`;

// Контейнер для поля ввода и кнопки отправки
const inputContainer = document.createElement('div');
inputContainer.style.cssText = `
    display: flex;
    gap: 5px;
    flex: 1;
`;

// Поле ввода
const inputField = document.createElement('input');
inputField.type = 'text';
inputField.placeholder = 'Введите команду...';
inputField.style.cssText = `
    padding: 10px;
    font-size: 14px;
    font-family: monospace;
    flex: 1;
    border: none;
    border-radius: 4px;
`;

// Кнопка отправить
const btnSend = document.createElement('button');
btnSend.textContent = '📤';
btnSend.style.cssText = `
    width: 40px;
    height: 40px;
    font-size: 18px;
    cursor: pointer;
    background: #4488ff;
    color: white;
    border: none;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
`;
btnSend.addEventListener('click', () => {
    const command = inputField.value.trim();
    if (command) {
        outputText.textContent = `Команда: ${command}`;
        inputField.value = '';
    }
});

inputContainer.appendChild(inputField);
inputContainer.appendChild(btnSend);

// Контейнер для кнопок
const buttonsContainer = document.createElement('div');
buttonsContainer.style.cssText = `
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
`;

// Создаем кнопки
const createButton = (text: string, onClick: () => void) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
        padding: 10px 15px;
        font-size: 14px;
        font-family: monospace;
        cursor: pointer;
        background: #4488ff;
        color: white;
        border: none;
        border-radius: 4px;
    `;
    btn.addEventListener('mousedown', onClick);
    return btn;
};

const btnLeft = createButton('← Влево', () => player.moveLeft(0.1));
const btnRight = createButton('Вправо →', () => player.moveRight(0.1));
const btnForward = createButton('↑ Вперед', () => player.moveForward(0.1));
const btnBackward = createButton('↓ Назад', () => player.moveBackward(0.1));
const btnJump = createButton('Прыгнуть', () => player.jump());
const btnPickup = createButton('Взять', () => player.togglePickup());

buttonsContainer.appendChild(btnLeft);
buttonsContainer.appendChild(btnRight);
buttonsContainer.appendChild(btnForward);
buttonsContainer.appendChild(btnBackward);
buttonsContainer.appendChild(btnJump);
buttonsContainer.appendChild(btnPickup);

// Вывод текста
const outputText = document.createElement('div');
outputText.style.cssText = `
    flex: 1;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-size: 14px;
    min-height: 40px;
    overflow-y: auto;
`;
outputText.textContent = 'Готов к командам...';

controlPanel.appendChild(inputContainer);
controlPanel.appendChild(buttonsContainer);
controlPanel.appendChild(outputText);
document.body.appendChild(controlPanel);

// Обработка Enter для отправки команды
inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        btnSend.click();
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

    // Обновляем контроллер камеры
    controller.update(dt);

    // Обновляем игрока
    player.update(dt);

    // Проверяем близость к кубу для подбора
    const distToCube = player.getPosition().distanceTo(cube.position);
    if (distToCube < 3) {
        player.setNearbyPickupTarget(cube);
        outputText.textContent = `Рядом с кубом (дистанция: ${distToCube.toFixed(2)}). Нажмите "Взять"`;
    } else {
        player.setNearbyPickupTarget(null);
        if (player.isCarrying) {
            outputText.textContent = 'Несу куб...';
        } else {
            outputText.textContent = `Позиция робота: x=${player.getPosition().x.toFixed(1)}, y=${player.getPosition().y.toFixed(1)}, z=${player.getPosition().z.toFixed(1)}`;
        }
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