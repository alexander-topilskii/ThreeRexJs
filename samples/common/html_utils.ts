import {Euler, Vector3} from "three";

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
