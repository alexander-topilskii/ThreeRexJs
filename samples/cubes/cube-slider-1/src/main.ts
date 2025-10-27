import * as THREE from 'three';
import { getDataTextBlock, getInfoBlock } from '../../../common/html_utils';
import { createCube, getPerspectiveCamera } from '../../../common/three_utils';
import { createTransformPanel, degToRad, radToDeg, Slider } from '../../../common/ui_utils';

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

    renderer.render(scene, camera);
}

animate();

// === Resize ===
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// === UI панель со слайдерами ===
// вынесено в samples/common/ui_utils.ts: radToDeg, degToRad, Slider, createTransformPanel


// Указатели на элементы
const posX = panel.querySelector('#posX') as Slider;
const posY = panel.querySelector('#posY') as Slider;
const posZ = panel.querySelector('#posZ') as Slider;
const rotX = panel.querySelector('#rotX') as Slider;
const rotY = panel.querySelector('#rotY') as Slider;
const rotZ = panel.querySelector('#rotZ') as Slider;

const posXO = panel.querySelector('#posXOut') as HTMLElement;
const posYO = panel.querySelector('#posYOut') as HTMLElement;
const posZO = panel.querySelector('#posZOut') as HTMLElement;
const rotXO = panel.querySelector('#rotXOut') as HTMLElement;
const rotYO = panel.querySelector('#rotYOut') as HTMLElement;
const rotZO = panel.querySelector('#rotZOut') as HTMLElement;

// Инициализация значениями из куба
function syncUIFromCube() {
    posX.value = cube.position.x.toFixed(2);
    posY.value = cube.position.y.toFixed(2);
    posZ.value = cube.position.z.toFixed(2);
    rotX.value = radToDeg(cube.rotation.x).toFixed(1);
    rotY.value = radToDeg(cube.rotation.y).toFixed(1);
    rotZ.value = radToDeg(cube.rotation.z).toFixed(1);

    posXO.textContent = posX.value;
    posYO.textContent = posY.value;
    posZO.textContent = posZ.value;
    rotXO.textContent = rotX.value;
    rotYO.textContent = rotY.value;
    rotZO.textContent = rotZ.value;
}

syncUIFromCube();

// Обработчики: UI -> куб
[posX, posY, posZ].forEach((s) => {
    s.addEventListener('input', () => {
        cube.position.x = parseFloat(posX.value);
        cube.position.y = parseFloat(posY.value);
        cube.position.z = parseFloat(posZ.value);
        posXO.textContent = posX.value;
        posYO.textContent = posY.value;
        posZO.textContent = posZ.value;
    });
});

[rotX, rotY, rotZ].forEach((s) => {
    s.addEventListener('input', () => {
        cube.rotation.x = degToRad(parseFloat(rotX.value));
        cube.rotation.y = degToRad(parseFloat(rotY.value));
        cube.rotation.z = degToRad(parseFloat(rotZ.value));
        rotXO.textContent = rotX.value;
        rotYO.textContent = rotY.value;
        rotZO.textContent = rotZ.value;
    });
});