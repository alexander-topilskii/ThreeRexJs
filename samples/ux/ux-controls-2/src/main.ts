import {createThree, ThreeComponents} from "../../../common/three/create_three_utils";
import {Box} from "../../../common/three/box_utils";
import '../../../common/kotlin/scope'
import {TransformPanel} from "../../../common/ui/slider_panel";
import {MovablePanels} from "../../../common/ui/movable_panels";
import {createDraggabilly} from "../../../common/ui/draggeble_utils";
import {createPlayerController} from "../../../common/player_utils";
import {GameLoopManager} from "../../../common/game/GameLoopManager";


// -- ui components
const draggableBox = createDraggabilly(document.getElementById('box')!)
const movablePanels = new MovablePanels()
const transformBoxPanel = new TransformPanel(
    {
        id: "transformBoxPanel",
        container: draggableBox,
        floating: false,
        anchor: {top: "12px", right: "12px"},
        initialPosition: {x: 0, y: 1, z: 2},
        initialRotationDeg: {x: 0, y: 45, z: 0},
    },
    ({type, value}) => {
        if (type === "position") {
            box.moveCube(value);
        } else {
            box.rotateCube(value)
        }
    }
);


// --- Three.js ---
const box = new Box();

const threeComponents: ThreeComponents = createThree()
    .also(threeComponents => {
            threeComponents.displayIn(movablePanels.rightPanel)
            threeComponents.addOnScene(box.mesh);
            threeComponents.resizeRendererToRightPane(movablePanels.rightPanel);

            movablePanels.addOnLeftLeftRightPanelSizeChanged(() => {
                threeComponents.resizeRendererToRightPane(movablePanels.rightPanel)
            })
        }
    );

const controller = createPlayerController(
    threeComponents.camera,
    threeComponents.renderer.domElement,
    {
        initialPosition: {x: 0, y: 2.5, z: 6},
        initialPitch: -0.35,
    }
);

const gameLoopManager = new GameLoopManager(
    [
        controller,
        threeComponents
    ]
).also(
    (manager) => manager.start()
)
