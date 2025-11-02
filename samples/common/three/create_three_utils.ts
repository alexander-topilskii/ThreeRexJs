import * as THREE from 'three';
import {Mesh, Object3D, Vector3} from 'three';
import {getPerspectiveCamera} from "./three_utils";
import {Updatable} from "../game/GameLoopManager";

export class ThreeComponents implements Updatable {
    constructor(
        public scene: THREE.Scene,
        public camera: THREE.PerspectiveCamera,
        public renderer: THREE.WebGLRenderer
    ) {
    }

    start(): void {

    }

    stop(): void {

    }

    onWindowResize(width: number, height: number) {
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    addOnScene(obj: Object3D) {
        this.scene.add(obj)
    }

    addAllOnScene(objs: Array<Object3D>) {
        objs.forEach(obj => this.scene.add(obj))
    }

    displayIn(element: HTMLElement) {
        element.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => this.resizeRendererToRightPane(element));
    }

    update(dt: number) {
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