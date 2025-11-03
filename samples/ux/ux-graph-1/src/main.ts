import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

type Series = 'kPowN' | 'factorial' | 'twoPowN2';

const kInput = document.getElementById('kInput') as HTMLInputElement;
const nMaxInput = document.getElementById('nMaxInput') as HTMLInputElement;
const regenBtn = document.getElementById('regen') as HTMLButtonElement;
const container = document.getElementById('scene') as HTMLDivElement;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b0d10');

const camera = new THREE.PerspectiveCamera(55, 2, 0.1, 5000);
camera.position.set(-40, 40, 120);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const key = new THREE.DirectionalLight(0xffffff, 1.0);
key.position.set(1, 2, 1);
scene.add(key);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const grid = new THREE.GridHelper(200, 20, 0x3a4453, 0x1f2835);
grid.rotation.x = Math.PI/2;
scene.add(grid);

const axes = new THREE.AxesHelper(100);
scene.add(axes);

function makeLabel(text: string) {
  const c = document.createElement('canvas');
  const dpr = 2;
  c.width = 512 * dpr; c.height = 128 * dpr;
  const ctx = c.getContext('2d')!;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#0b0d10';
  ctx.fillRect(0,0,512,128);
  ctx.fillStyle = '#e6f1ff';
  ctx.font = '24px system-ui,Segoe UI,Roboto,Arial,sans-serif';
  ctx.fillText(text, 16, 40);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(32, 8, 1);
  return sp;
}

const labelX = makeLabel('X = N'); labelX.position.set(90, 0, 0); scene.add(labelX);
const labelY = makeLabel('Y = log10(f(N))'); labelY.position.set(0, 90, 0); scene.add(labelY);
const labelZ = makeLabel('Z = серия'); labelZ.position.set(0, 0, 90); scene.add(labelZ);

function log10Factorial(n: number): number {
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log10(i);
  return s;
}

function computeSeries(k: number, nMax: number) {
  const data = { kPowN: [] as number[], factorial: [] as number[], twoPowN2: [] as number[] };
  for (let n = 1; n <= nMax; n++) {
    data.kPowN.push(n * Math.log10(k));
    data.factorial.push(log10Factorial(n));
    data.twoPowN2.push(n*n * Math.log10(2));
  }
  return data;
}

const seriesColors = { kPowN: 0x7aa2f7, factorial: 0x9ece6a, twoPowN2: 0xf7768e };
const seriesOffsetZ = { kPowN: -20, factorial: 0, twoPowN2: 20 };

let group = new THREE.Group(); scene.add(group);

function build(k: number, nMax: number) {
  scene.remove(group);
  group = new THREE.Group(); scene.add(group);

  const data = computeSeries(k, nMax);
  const allLogs = [...data.kPowN, ...data.factorial, ...data.twoPowN2];
  const maxLog = Math.max(...allLogs);
  const height = 80;
  const yScale = (v: number) => (v / maxLog) * height;
  const xScale = (n: number) => (n / nMax) * 100;

  function addLine(series: Series, logs: number[]) {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < logs.length; i++) {
      const n = i + 1;
      const x = xScale(n);
      const y = yScale(logs[i]);
      const z = seriesOffsetZ[series];
      pts.push(new THREE.Vector3(x, y, z));
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: seriesColors[series] });
    const line = new THREE.Line(geom, mat);
    group.add(line);

    const sphereGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({ color: seriesColors[series], metalness: 0.0, roughness: 1.0 });
    for (const p of pts) {
      const m = new THREE.Mesh(sphereGeo, sphereMat);
      m.position.copy(p);
      group.add(m);
    }

    const lbl = makeLabel(series === 'kPowN' ? 'k^N' : series === 'factorial' ? 'N!' : '2^{N^2}');
    const last = pts[pts.length-1];
    lbl.position.set(last.x + 6, last.y + 4, last.z);
    group.add(lbl);
  }

  addLine('kPowN', data.kPowN);
  addLine('factorial', data.factorial);
  addLine('twoPowN2', data.twoPowN2);
}

build(2, 20);

function onResize() {
  const w = (document.getElementById('scene') as HTMLDivElement).clientWidth;
  const h = (document.getElementById('scene') as HTMLDivElement).clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', onResize);

regenBtn.addEventListener('click', () => {
  const k = Math.max(2, Math.min(16, parseInt(kInput.value) || 2));
  const nMax = Math.max(5, Math.min(200, parseInt(nMaxInput.value) || 20));
  build(k, nMax);
});

function tick() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
