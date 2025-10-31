import {Mesh, Vector3} from "three";
import * as THREE from "three";
import {Updatable} from "../game/GameLoopManager";
import { Vec3Num } from "../ui/slider_panel";


export function createCube(position: Vector3 = new Vector3(0, 0, 0)): Mesh {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshNormalMaterial();
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = position.x;
    cube.position.y = position.y;
    cube.position.z = position.z;

    return cube;
}

export class Box implements Updatable {

    mesh: Mesh

    constructor(position: Vector3 = new Vector3(0, 0, 0)) {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshNormalMaterial();
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = position.x;
        cube.position.y = position.y;
        cube.position.z = position.z;

        this.mesh = cube;
    }

    start(): void {

    }

    stop(): void {
    }

    update(dt: number): void {

    }

    moveCube(value: Vec3Num) {
        this.mesh.position.set(value.x, value.y, value.z)
    }

    rotateCube(value: Vec3Num) {
        this.mesh.rotation.set(value.x, value.y, value.z);
    }

    onChanged() {

    }
}