import Split from 'split.js';
import {Mesh} from 'three';
import {createThree, ThreeComponents} from "../../../common/three/create_three_utils";
import {createCube} from "../../../common/three/box_utils";
import '../../../common/kotlin/scope'
import Draggabilly from 'draggabilly';
import {createTransformPanel} from "../../../common/panel_utils";
import {TransformPanel} from "../../../common/ui/slider_panel";
import {degToRad, radToDeg} from "../../../common/ui_utils";

const mainSplit = Split(['#left', '#right'], {
    sizes: [30, 70],
    minSize: [160, 200],
    gutterSize: 8,
    direction: 'horizontal',
    onDrag: () => resizeRendererToRightPane(),
});

const topBottomLeftSplit = Split(['#left-top', '#left-bottom'], {
    sizes: [50, 50],
    minSize: [50, 200],
    gutterSize: 8,
    direction: 'vertical',
});


const rightPanel = document.getElementById('right')!;
const leftPanel = document.getElementById('left-top')!;


// --- Three.js ---
const threeComponents: ThreeComponents = createThree().also(threeComponents => {
    threeComponents.displayIn(rightPanel)
});

const cube: Mesh = createCube();
threeComponents.addOnScene(cube);

function resizeRendererToRightPane() {
    const rect = rightPanel.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));

    threeComponents.onWindowResize(w, h)
}

// первичная подгонка размера
resizeRendererToRightPane();

const tp = new TransformPanel({
    id: "transformPanel",
    container: leftPanel,
    floating: false,
    anchor: {top: "12px", right: "12px"},
    initialPosition: {x: 0, y: 1, z: 2},
    initialRotationDeg: {x: 0, y: 45, z: 0},
});

// Подписка на изменения
tp.onChange(({type, value}) => {
    if (type === "position") {
        cube.position.set(value.x, value.y, value.z);
    } else {
        cube.rotation.set(value.x/10, value.y/10, value.z/10);
    }
});

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    tp.setPosition(cube.position)
    tp.setRotationDeg(cube.rotation)

    threeComponents.draw()
}

animate();

window.addEventListener('resize', resizeRendererToRightPane);


const box = document.getElementById('box')!;

const draggie = new Draggabilly(box, {containment: document.body});