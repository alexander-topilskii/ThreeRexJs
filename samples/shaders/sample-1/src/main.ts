import * as THREE from 'three';
import fragment from './shaders/frag.glsl?raw';
import vertex from './shaders/vert.glsl?raw';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 1.5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
const material = new THREE.ShaderMaterial({
  uniforms: {
    u_time: { value: 0 },
    u_res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  },
  vertexShader: vertex,
  fragmentShader: fragment
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  material.uniforms.u_time.value += clock.getDelta();
  renderer.setSize(window.innerWidth, window.innerHeight);
  material.uniforms.u_res.value.set(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
