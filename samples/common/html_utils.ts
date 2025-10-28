import {Euler, Vector3} from "three";
import * as THREE from "three";
import {degToRad, radToDeg} from "./ui_utils";

export function getDataTextBlock(cubePosition: Vector3, cubeRotation: Euler): string {
    return `pos: x=${cubePosition.x.toFixed(2)}, y=${cubePosition.y.toFixed(2)}, z=${cubePosition.z.toFixed(2)}<br>` +
        `rot: x=${radToDeg(cubeRotation.x % Math.PI).toFixed(2)}, y=${radToDeg(cubeRotation.y % Math.PI).toFixed(2)}, z=${radToDeg(cubeRotation.z % Math.PI).toFixed(2)}`;
}

export function getInfoBlock() {
    const info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.left = '10px';
    info.style.color = 'white';
    info.style.fontFamily = 'monospace';
    info.style.background = 'rgba(0, 0, 0, 0.5)';
    info.style.padding = '6px 8px';
    info.style.borderRadius = '4px';
    return info
}

export function updateCubePositionText(
    panel: HTMLDivElement,
    position: THREE.Vector3,
) {
    const {x, y, z} = panel.positions;
    position.x = parseFloat(x.value);
    position.y = parseFloat(y.value);
    position.z = parseFloat(z.value);
    panel.updatePositions(panel.positions);
}

export function updateCubeRotationText(
    panel: HTMLDivElement,
    rotation: THREE.Euler,
) {
    const {x, y, z} = panel.rotations;
    rotation.x = degToRad(parseFloat(x.value));
    rotation.y = degToRad(parseFloat(y.value));
    rotation.z = degToRad(parseFloat(z.value));

    panel.updateRotation?.(panel.rotations);
}