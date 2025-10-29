import * as THREE from 'three';
import {Vector3} from "three";
import {getPerspectiveCamera} from "./three_utils";




interface ThreeComponents {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
}


export function createThree(
    cameraPosition: Vector3 = new Vector3(0, 0, 3)
): ThreeComponents {
    const scene = new THREE.Scene();

    const camera = getPerspectiveCamera(cameraPosition);

    const renderer = new THREE.WebGLRenderer({antialias: true});

    return {scene, camera, renderer};
}