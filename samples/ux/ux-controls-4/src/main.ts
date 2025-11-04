import {createThree, ThreeComponents} from "../../../common/three/create_three_utils";
import {Box} from "../../../common/three/box_utils";
import '../../../common/kotlin/scope'
import {TransformPanel} from "../../../common/ui/slider_panel";
import {MovablePanels} from "../../../common/ui/movable_panels";
import {createDraggabilly} from "../../../common/ui/draggeble_utils";
import {createPlayerController} from "../../../common/player_utils";
import {GameLoopManager} from "../../../common/game/GameLoopManager";
import {Plane} from "../../../common/three/plane_utils";
import {Object3D, Vector3} from "three";
import * as THREE from "three";


// -- ui components
const draggableBox = createDraggabilly(document.getElementById('box')!)
const movablePanels = new MovablePanels()
const transformBoxPanel = new TransformPanel(
    {
        id: "transformBoxPanel",
        container: draggableBox,
        floating: false,
        anchor: {top: "112px", right: "112px"},
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

function generateBoxes(width: number, height: number): Array<Object3D> {
    const boxes = Array()

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            const box = new Box(new Vector3(i * 1.5, 0, j * 1.5));
            boxes.push(box.mesh);
        }
    }
    return boxes
}

function getInstancedBoxes(count: number) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ vertexColors: true }); //new THREE.MeshStandardMaterial({metalness: 0.0, roughness: 1.0, vertexColors: true});
    const instanced = new THREE.InstancedMesh(geometry, material, count);
    instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // если будем менять матрицы в рантайме

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();


    for (let i = 0; i < count; i++) {
        dummy.position.set(
            THREE.MathUtils.randFloatSpread(200),
            THREE.MathUtils.randFloatSpread(200),
            THREE.MathUtils.randFloatSpread(200)
        );
        const s = THREE.MathUtils.randFloat(0.6, 1.2);
        dummy.scale.set(s, s, s);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        dummy.updateMatrix();
        instanced.setMatrixAt(i, dummy.matrix);


        color.setHSL(Math.random(), 0.5, 0.6);
        instanced.setColorAt(i, color);
    }
    return instanced;
}

// --- Three.js ---
const box = new Box();
const plane = new Plane();
const boxes = generateBoxes(2, 2)
// const boxes = generateBoxes(2, 2)

const threeComponents: ThreeComponents = createThree()
    .also(threeComponents => {
            threeComponents.displayIn(movablePanels.rightPanel)
            threeComponents.addOnScene(box.mesh);
            threeComponents.addOnScene(plane.grid);
            threeComponents.addOnScene(plane.plane);
            threeComponents.addOnScene(getInstancedBoxes(1000));
            threeComponents.addAllOnScene(boxes);
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
