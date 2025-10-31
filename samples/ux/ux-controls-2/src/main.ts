import {Mesh} from 'three';
import {createThree, ThreeComponents} from "../../../common/three/create_three_utils";
import {createCube} from "../../../common/three/box_utils";
import '../../../common/kotlin/scope'
import {TransformPanel} from "../../../common/ui/slider_panel";
import {MovablePanels} from "../../../common/ui/movable_panels";
import {createDraggabilly} from "../../../common/ui/draggeble_utils";
import {createPlayerController} from "../../../common/player_utils";
import {GameLoopManager} from "../../../common/game/GameLoopManager";


// -- ui components
const draggableBox = createDraggabilly(document.getElementById('box')!)
const movablePanels = new MovablePanels()
const transformBoxPanel = new TransformPanel({
    id: "transformBoxPanel",
    container: draggableBox,
    floating: false,
    anchor: {top: "12px", right: "12px"},
    initialPosition: {x: 0, y: 1, z: 2},
    initialRotationDeg: {x: 0, y: 45, z: 0},
}, ({type, value}) => {
    if (type === "position") {
        cube.position.set(value.x, value.y, value.z);
    } else {
        cube.rotation.set(value.x, value.y, value.z);
    }
});


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

const controller = createPlayerController(threeComponents.camera, threeComponents.renderer.domElement, {
    initialPosition: { x: 0, y: 2.5, z: 6 },
    initialPitch: -0.35,
});

const gameLoopManager = new GameLoopManager()

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    controller.update(0.016)

    GameLoopManager.
    transformBoxPanel.setPosition(cube.position)
    transformBoxPanel.setRotationDeg(cube.rotation)

    threeComponents.draw()
}

animate();


