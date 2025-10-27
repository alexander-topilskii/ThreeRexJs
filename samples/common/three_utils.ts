

import * as THREE from "three";
import {Mesh} from "three";

export function getPerspectiveCamera(positionZ : number = 3) {
    const camera= new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camera.position.z = positionZ;

    return camera;
}

export function createCube(): Mesh  {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshNormalMaterial();
    return new THREE.Mesh(geometry, material);
}
