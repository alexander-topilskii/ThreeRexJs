import * as THREE from 'three';
import {
    getDataTextBlock,
    getInfoBlock,
    updateCubePositionText,
    updateCubeRotationText
} from '../../../common/html_utils';
import {createCube, getPerspectiveCamera} from '../../../common/three_utils';
import {createTransformPanel, degToRad, radToDeg, Slider} from '../../../common/ui_utils';

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
const posX = panel.querySelector('#posX') as Slider;
const posY = panel.querySelector('#posY') as Slider;
const posZ = panel.querySelector('#posZ') as Slider;
const rotX = panel.querySelector('#rotX') as Slider;
const rotY = panel.querySelector('#rotY') as Slider;
const rotZ = panel.querySelector('#rotZ') as Slider;

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
    posX.value = cube.position.x.toFixed(2);
    posY.value = cube.position.y.toFixed(2);
    posZ.value = cube.position.z.toFixed(2);

    rotX.value = radToDeg(cube.rotation.x % Math.PI).toFixed(1);
    rotY.value = radToDeg(cube.rotation.y % Math.PI).toFixed(1);
    rotZ.value = radToDeg(cube.rotation.z % Math.PI).toFixed(1);

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


const posXOText = panel.querySelector('#posXOut') as HTMLElement;
const posYOText = panel.querySelector('#posYOut') as HTMLElement;
const posZOText = panel.querySelector('#posZOut') as HTMLElement;
const rotXOText = panel.querySelector('#rotXOut') as HTMLElement;
const rotYOText = panel.querySelector('#rotYOut') as HTMLElement;
const rotZOText = panel.querySelector('#rotZOut') as HTMLElement;

// Инициализация значениями из куба
function syncUIFromCube() {
    posX.value = cube.position.x.toFixed(2);
    posY.value = cube.position.y.toFixed(2);
    posZ.value = cube.position.z.toFixed(2);

    rotX.value = radToDeg(cube.rotation.x).toFixed(1);
    rotY.value = radToDeg(cube.rotation.y).toFixed(1);
    rotZ.value = radToDeg(cube.rotation.z).toFixed(1);

    posXOText.textContent = posX.value;
    posYOText.textContent = posY.value;
    posZOText.textContent = posZ.value;
    rotXOText.textContent = rotX.value;
    rotYOText.textContent = rotY.value;
    rotZOText.textContent = rotZ.value;
}

syncUIFromCube();


// Обработчики: UI -> куб
[posX, posY, posZ].forEach((s) => {
    s.addEventListener('input', () => {
        updateCubePositionText(posX, posY, posZ, cube.position, posXOText, posYOText, posZOText);
    });
});


[rotX, rotY, rotZ].forEach((s) => {
    s.addEventListener('input', () => {
        updateCubeRotationText(rotX, rotY, rotZ, cube.rotation, rotXOText, rotYOText, rotZOText);
    });
});