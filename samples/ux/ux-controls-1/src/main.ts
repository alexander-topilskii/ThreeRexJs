import Split from 'split.js';
import * as THREE from 'three';
import {createThree} from "../../../common/three/create_three_utils";

const split = Split(['#left', '#right'], {
    sizes: [30, 70],
    minSize: [160, 200],
    gutterSize: 8,
    onDrag: () => resizeRendererToRightPane(),
});

const right = document.getElementById('right')!;

// --- Three.js ---
const {scene, camera, renderer} = createThree()


right.appendChild(renderer.domElement);

const cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshNormalMaterial());
scene.add(cube);

function resizeRendererToRightPane() {
    const rect = right.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));


    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

// первичная подгонка размера
resizeRendererToRightPane();

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', resizeRendererToRightPane);
