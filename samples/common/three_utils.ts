import * as THREE from "three";
import {Mesh} from "three";
import {radToDeg} from "./ui_utils";

export function getPerspectiveCamera(positionZ: number = 3) {
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camera.position.z = positionZ;

    return camera;
}

export function createCube(): Mesh {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshNormalMaterial();
    return new THREE.Mesh(geometry, material);
}


declare module 'three' {
    interface Object3D {
        // Old signature (keep for backward compatibility)
        grabPositionTo(
            xTarget: { value: string | number },
            yTarget: { value: string | number },
            zTarget: { value: string | number }
        ): void;
        // New signature: grouped targets object with x/y/z
        grabPositionTo(targets: { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } }): void;

        // Old signature
        grabRotationTo(
            xTarget: { value: string | number },
            yTarget: { value: string | number },
            zTarget: { value: string | number }
        ): void;
        // New signature: grouped targets object with x/y/z
        grabRotationTo(targets: { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } }): void;
    }
}

THREE.Object3D.prototype.grabPositionTo = function (
    a: { value: string | number } | { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } },
    b?: { value: string | number },
    c?: { value: string | number }
) {
    let xTarget: { value: string | number };
    let yTarget: { value: string | number };
    let zTarget: { value: string | number };

    if (b && c) {
        xTarget = a as { value: string | number };
        yTarget = b;
        zTarget = c;
    } else {
        const group = a as { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } };
        xTarget = group.x;
        yTarget = group.y;
        zTarget = group.z;
    }

    xTarget.value = this.position.x.toFixed(2);
    yTarget.value = this.position.y.toFixed(2);
    zTarget.value = this.position.z.toFixed(2);
};

THREE.Object3D.prototype.grabRotationTo = function (
    a: { value: string | number } | { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } },
    b?: { value: string | number },
    c?: { value: string | number }
) {
    let xTarget: { value: string | number };
    let yTarget: { value: string | number };
    let zTarget: { value: string | number };

    if (b && c) {
        xTarget = a as { value: string | number };
        yTarget = b;
        zTarget = c;
    } else {
        const group = a as { x: { value: string | number }; y: { value: string | number }; z: { value: string | number } };
        xTarget = group.x;
        yTarget = group.y;
        zTarget = group.z;
    }

    xTarget.value = radToDeg(this.rotation.x % Math.PI);
    yTarget.value = radToDeg(this.rotation.y % Math.PI);
    zTarget.value = radToDeg(this.rotation.z % Math.PI);
};