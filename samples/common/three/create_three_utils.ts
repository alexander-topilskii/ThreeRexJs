import * as THREE from 'three';
import {Mesh, Vector3} from 'three';
import {getPerspectiveCamera} from "./three_utils";

export class ThreeComponents {
    constructor(
        public scene: THREE.Scene,
        public camera: THREE.PerspectiveCamera,
        public renderer: THREE.WebGLRenderer
    ) {
    };

    onWindowResize(width: number, height: number) {
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    addOnScene(cube: Mesh) {
        this.scene.add(cube)
    }

    displayIn(element: HTMLElement) {
        element.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.resizeRendererToRightPane(element));
    }

    draw() {
        this.renderer.render(this.scene, this.camera);
    }

    resizeRendererToRightPane(container: HTMLElement) {
        const rect = container.getBoundingClientRect();
        const w = Math.max(1, Math.floor(rect.width));
        const h = Math.max(1, Math.floor(rect.height));

        this.onWindowResize(w, h)
    }
}


export function createThree(
    cameraPosition: Vector3 = new Vector3(0, 0, 3)
): ThreeComponents {
    const scene = new THREE.Scene();

    const camera = getPerspectiveCamera(cameraPosition);

    const renderer = new THREE.WebGLRenderer({antialias: true});

    return new ThreeComponents(scene, camera, renderer);
}