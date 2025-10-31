import {Mesh} from 'three';
import {createThree, ThreeComponents} from "../../../common/three/create_three_utils";
import {createCube} from "../../../common/three/box_utils";
import '../../../common/kotlin/scope'
import {TransformPanel} from "../../../common/ui/slider_panel";
import {MovablePanels} from "../../../common/ui/movable_panels";
import {createDraggabilly} from "../../../common/ui/draggeble_utils";


// -- ui components
const draggableBox = createDraggabilly(document.getElementById('box')!)
const movablePanels = new MovablePanels()

// --- Three.js ---
const cube: Mesh = createCube();

const threeComponents: ThreeComponents = createThree()
    .also(threeComponents => {
        threeComponents.displayIn(movablePanels.rightPanel)
        threeComponents.addOnScene(cube);
        threeComponents.resizeRendererToRightPane(movablePanels.rightPanel);

        movablePanels.addOnLeftLeftRightPanelSizeChanged(() => {
            threeComponents.resizeRendererToRightPane(movablePanels.rightPanel)
        })
    });

const transformPanel = new TransformPanel({
    id: "transformPanel",
    container: draggableBox,
    floating: false,
    anchor: {top: "12px", right: "12px"},
    initialPosition: {x: 0, y: 1, z: 2},
    initialRotationDeg: {x: 0, y: 45, z: 0},
});

// Подписка на изменения
transformPanel.onChange(({type, value}) => {
    if (type === "position") {
        cube.position.set(value.x, value.y, value.z);
    } else {
        cube.rotation.set(value.x / 10, value.y / 10, value.z / 10);
    }
});

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    transformPanel.setPosition(cube.position)
    transformPanel.setRotationDeg(cube.rotation)

    threeComponents.draw()
}

animate();


