import {Euler, Vector3} from "three";
import * as THREE from "three";
import {degToRad} from "./ui_utils";

export function getDataTextBlock(cubePosition: Vector3, cubeRotation: Euler): string {
    return `pos: x=${cubePosition.x.toFixed(2)}, y=${cubePosition.y.toFixed(2)}, z=${cubePosition.z.toFixed(2)}<br>` +
        `rot: x=${cubeRotation.x.toFixed(2)}, y=${cubeRotation.y.toFixed(2)}, z=${cubeRotation.z.toFixed(2)}`;
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
    posX: HTMLInputElement,
    posY: HTMLInputElement,
    posZ: HTMLInputElement,
    position: THREE.Vector3,
    posXOText: HTMLElement,
    posYOText: HTMLElement,
    posZOText: HTMLElement
) {
    position.x = parseFloat(posX.value);
    position.y = parseFloat(posY.value);
    position.z = parseFloat(posZ.value);
    posXOText.textContent = posX.value;
    posYOText.textContent = posY.value;
    posZOText.textContent = posZ.value;
}


export function updateCubeRotationText(
    rotX: HTMLInputElement,
    rotY: HTMLInputElement,
    rotZ: HTMLInputElement,
    rotation: THREE.Euler,
    rotXOText: HTMLElement,
    rotYOText: HTMLElement,
    rotZOText: HTMLElement
) {
    rotation.x = degToRad(parseFloat(rotX.value));
    rotation.y = degToRad(parseFloat(rotY.value));
    rotation.z = degToRad(parseFloat(rotZ.value));

    rotXOText.textContent = rotX.value;
    rotYOText.textContent = rotY.value;
    rotZOText.textContent = rotZ.value;
}