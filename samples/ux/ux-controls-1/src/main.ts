import Split from 'split.js';
import {Mesh} from 'three';
import {createThree, ThreeComponents} from "../../../common/three/create_three_utils";
import {createCube} from "../../../common/three/box_utils";

const split = Split(['#left', '#right'], {
    sizes: [30, 70],
    minSize: [160, 200],
    gutterSize: 8,
    onDrag: () => resizeRendererToRightPane(),
});

const right = document.getElementById('right')!;

// --- Three.js ---
const threeComponents: ThreeComponents = createThree()
    .also((it: ThreeComponents) => it.displayIn(right))

const cube: Mesh = createCube()
    .also((cube: Mesh) => threeComponents.addOnScene(cube));

function resizeRendererToRightPane() {
    const rect = right.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));

    threeComponents.onWindowResize(w, h)
}

// первичная подгонка размера
resizeRendererToRightPane();

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    threeComponents.draw()
}

animate();

window.addEventListener('resize', resizeRendererToRightPane);
