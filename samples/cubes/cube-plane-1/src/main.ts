import * as THREE from 'three';
import {
    getDataTextBlock,
    getInfoBlock,
    updateCubePositionText,
    updateCubeRotationText
} from '../../../common/html_utils';
import {createCube, getPerspectiveCamera} from '../../../common/three_utils';
import {createTransformPanel} from '../../../common/panel_utils';
import {createGradientPlane, createGrid} from "./plane_helpers";

// === Сцена ===
const scene = new THREE.Scene();
const camera = getPerspectiveCamera(3);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Параметры управления камерой (WASD + мышь + QE) ---
let yaw = 0;            // вращение вокруг Y
let pitch = -0.35;      // лёгкий наклон вниз
const mouseSensitivity = 0.0025; // чувствительность мыши
const moveSpeed = 4;             // м/с
const verticalSpeed = 4;         // м/с для Q/E
const keys = new Set<string>();
let prevTime = performance.now();

// Начальная позиция/ориентация камеры
camera.position.set(0, 2.5, 6);
camera.rotation.order = 'YXZ';
camera.rotation.y = yaw;
camera.rotation.x = pitch;

// Pointer Lock для поворота мышью
renderer.domElement.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
    // Можно подсвечивать состояние или показать подсказку — опустим для краткости
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement !== renderer.domElement) return;
    yaw   -= e.movementX * mouseSensitivity;
    pitch -= e.movementY * mouseSensitivity;
    const limit = Math.PI / 2 - 0.01; // чтобы не переворачивало
    if (pitch > limit) pitch = limit;
    if (pitch < -limit) pitch = -limit;
});

// Клавиатура: WASD + Q/E
window.addEventListener('keydown', (e) => {
    keys.add(e.code);
});
window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
});

const tmpMove = new THREE.Vector3();

const cube = createCube();
scene.add(cube);

const ground = createGradientPlane(40, 40);
scene.add(ground);

const grid = createGrid(40, 40, ground.position)
scene.add(grid);


// === Overlay для текста ===
const info = getInfoBlock()
const panel = createTransformPanel();
const autoRotate = panel.querySelector('#autoRotate') as HTMLInputElement;

document.body.appendChild(info);

// === Анимация ===
function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const dt = (now - prevTime) / 1000;
    prevTime = now;

    // Применяем вращение камеры от мыши
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    // Движение камеры в плоскости XZ по yaw (как FPS), Q/E — по Y
    tmpMove.set(0, 0, 0);
    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);

    if (keys.has('KeyW')) {
        tmpMove.x -= sinY;
        tmpMove.z -= cosY;
    }
    if (keys.has('KeyS')) {
        tmpMove.x += sinY;
        tmpMove.z += cosY;
    }
    if (keys.has('KeyA')) {
        tmpMove.x -= cosY;
        tmpMove.z += sinY;
    }
    if (keys.has('KeyD')) {
        tmpMove.x += cosY;
        tmpMove.z -= sinY;
    }

    if (tmpMove.lengthSq() > 0) {
        tmpMove.normalize().multiplyScalar(moveSpeed * dt);
        camera.position.add(tmpMove);
    }

    let vY = 0;
    if (keys.has('KeyE')) vY += 1;
    if (keys.has('KeyQ')) vY -= 1;
    if (vY !== 0) camera.position.y += vY * verticalSpeed * dt;

    if (autoRotate.checked) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }

    // обновляем текст
    info.innerHTML = getDataTextBlock(cube.position, cube.rotation);
    syncUIFromCube();

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
    panel.updatePositions(panel.positions);
    panel.updateRotation(panel.rotations);
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
});//d