import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

// ===== Камера и сцены =====
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
camera.position.set(0, 0, 900);

const sceneGL = new THREE.Scene();
// Важно: НИКАКОГО фона у WebGL-сцены — она будет прозрачной
sceneGL.background = null;

const sceneCSS = new THREE.Scene();

// ===== WebGL-рендерер (прозрачный) =====
const webgl = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,              // ключ к прозрачности
    premultipliedAlpha: true
});
webgl.setPixelRatio(Math.min(devicePixelRatio, 2));
webgl.setSize(window.innerWidth, window.innerHeight);
webgl.setClearColor(0x000000, 0); // альфа = 0

// ===== CSS3D-рендерер =====
const css = new CSS3DRenderer();
css.setSize(window.innerWidth, window.innerHeight);
css.domElement.className = 'css3d';
css.domElement.style.pointerEvents = 'auto'; // пусть iframe кликается

// ===== Контейнер и порядок слоёв =====
const stage = document.getElementById('stage')!;
stage.appendChild(webgl.domElement);
stage.appendChild(css.domElement);

// ===== Немного 3D, чтобы было видно «единый» вид =====
sceneGL.add(new THREE.AmbientLight(0xffffff, 0.35));
const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(2, 3, 4);
sceneGL.add(dir);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(200, 200, 200),
    new THREE.MeshStandardMaterial({ color: 0x61dafb, metalness: 0.2, roughness: 0.45 })
);
cube.position.set(-260, -60, 0);
sceneGL.add(cube);

// ===== iframe как «экран сайта» в 3D =====
const iframe = document.createElement('iframe');
// ВАЖНО: выбери URL, который разрешает встраивание (не блокирует X-Frame-Options/CSP)
iframe.src = 'https://example.com';
iframe.style.width = '960px';
iframe.style.height = '600px';
iframe.style.border = '0';
iframe.style.borderRadius = '12px';
iframe.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';

const screen3D = new CSS3DObject(iframe);
screen3D.position.set(260, 20, 0);
screen3D.rotation.y = THREE.MathUtils.degToRad(-12);
screen3D.rotation.x = THREE.MathUtils.degToRad(-3);
sceneCSS.add(screen3D);

// ===== OrbitControls на верхнем слое (мышь на CSS) =====
const controls = new OrbitControls(camera, css.domElement);
controls.enableDamping = true;

// ===== Resize =====
window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    webgl.setSize(w, h);
    css.setSize(w, h);
});

// ===== Рендер-цикл =====
function tick() {
    controls.update();

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.015;

    // Один и тот же взгляд камеры для обоих миров
    webgl.render(sceneGL, camera);
    css.render(sceneCSS, camera);
    requestAnimationFrame(tick);
}
tick();
