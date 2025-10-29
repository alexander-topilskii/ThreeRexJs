import {Mesh, Vector3} from "three";
import * as THREE from "three";


export function createCube(position: Vector3 = new Vector3(0, 0, 0)): Mesh {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshNormalMaterial();
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = position.x;
    cube.position.y = position.y;
    cube.position.z = position.z;

    return cube;
}