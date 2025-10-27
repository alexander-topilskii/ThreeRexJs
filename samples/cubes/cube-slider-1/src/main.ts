import * as THREE from 'three';
import { getDataTextBlock } from '../../../common/html_utils';
import { getInfoBlock } from '../../../common/html_utils';
import { createCube, getPerspectiveCamera } from '../../../common/three_utils';

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
const panel = createPanel();
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
function radToDeg(r: number) { return r * 180 / Math.PI; }
function degToRad(d: number) { return d * Math.PI / 180; }

type Slider = HTMLInputElement;

function createPanel() {
    const panel = document.createElement('div');
    panel.style.position = 'absolute';
    panel.style.top = '10px';
    panel.style.right = '10px';
    panel.style.minWidth = '260px';
    panel.style.padding = '10px';
    panel.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, monospace';
    panel.style.fontSize = '12px';
    panel.style.color = '#fff';
    panel.style.background = 'rgba(0,0,0,0.6)';
    panel.style.border = '1px solid rgba(255,255,255,0.15)';
    panel.style.borderRadius = '8px';
    panel.style.backdropFilter = 'blur(6px)';
    panel.style.userSelect = 'none';

    panel.innerHTML = `
    <div style="font-weight:600; margin-bottom:6px;">Controls</div>
    <label style="display:flex;align-items:center;gap:8px;margin:6px 0;">
      <input id="autoRotate" type="checkbox" checked />
      <span>Auto-rotate</span>
    </label>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1); margin:8px 0;">
    <div style="font-weight:600; margin:6px 0 2px;">Position</div>
    <div id="posRows"></div>
    <div style="font-weight:600; margin:10px 0 2px;">Rotation (deg)</div>
    <div id="rotRows"></div>
  `;

    function row(label: string, id: string, min: number, max: number, step: number): HTMLDivElement {
        const wrap = document.createElement('div');
        wrap.style.display = 'grid';
        wrap.style.gridTemplateColumns = '28px 1fr 48px';
        wrap.style.alignItems = 'center';
        wrap.style.gap = '8px';
        wrap.style.margin = '4px 0';

        const l = document.createElement('span');
        l.textContent = label;

        const s = document.createElement('input');
        s.type = 'range';
        s.id = id;
        s.min = String(min);
        s.max = String(max);
        s.step = String(step);

        const out = document.createElement('span');
        out.id = id + 'Out';
        out.style.textAlign = 'right';

        wrap.appendChild(l);
        wrap.appendChild(s);
        wrap.appendChild(out);
        return wrap;
    }

    (panel.querySelector('#posRows') as HTMLElement).append(
        row('x', 'posX', -5, 5, 0.01),
        row('y', 'posY', -5, 5, 0.01),
        row('z', 'posZ', -5, 5, 0.01),
    );

    (panel.querySelector('#rotRows') as HTMLElement).append(
        row('x', 'rotX', -180, 180, 0.1),
        row('y', 'rotY', -180, 180, 0.1),
        row('z', 'rotZ', -180, 180, 0.1),
    );

    document.body.appendChild(panel);
    return panel;
}


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