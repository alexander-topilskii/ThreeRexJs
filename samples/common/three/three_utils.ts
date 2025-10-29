import * as THREE from "three";
import {Mesh, Vector3} from "three";
import {radToDeg} from "../ui_utils";

export function getPerspectiveCamera( cameraPosition: Vector3 = new Vector3(0, 0, 3)) {
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camera.position.x = cameraPosition.x;
    camera.position.y = cameraPosition.y;
    camera.position.z = cameraPosition.z;

    return camera;
}



declare module 'three' {
    interface Object3D {
        // Grouped targets object with x/y/z
        grabPositionTo(targets: { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } }): void;
        // Grouped targets object with x/y/z
        grabRotationTo(targets: { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } }): void;
    }
}

THREE.Object3D.prototype.grabPositionTo = function (
    targets: { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } }
) {
    const xTarget = targets.x;
    const yTarget = targets.y;
    const zTarget = targets.z;

    xTarget.value = this.position.x.toFixed(2);
    yTarget.value = this.position.y.toFixed(2);
    zTarget.value = this.position.z.toFixed(2);
};

THREE.Object3D.prototype.grabRotationTo = function (
    targets: { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } }
) {
    const xTarget = targets.x;
    const yTarget = targets.y;
    const zTarget = targets.z;

    xTarget.value = radToDeg(this.rotation.x % Math.PI);
    yTarget.value = radToDeg(this.rotation.y % Math.PI);
    zTarget.value = radToDeg(this.rotation.z % Math.PI);
};