import * as THREE from 'three';
import {Vector3} from "three";

//Grid
export function createGrid(width: number, height: number, groundPosition: Vector3, colors: {
    top: string;
    bottom: string
} = {top: "0x8892b0", bottom: "0x334155"}) {
    let gridHelper = new THREE.GridHelper(40, 40, 0x8892b0, 0x334155);
    gridHelper.position.y = groundPosition.y + 0.001;
    return gridHelper
}

// === Хелперы ===
export function createGradientPlane(width: number, height: number, colors: { top: string; bottom: string } =
{
    top: '#2f74e2',
    bottom: '#0b1021',
}) {
    const tex = makeVerticalGradientTexture(colors.top, colors.bottom);

    // важно для корректной гаммы в новых версиях three
    (tex as any).colorSpace = (THREE as any).SRGBColorSpace ?? (THREE as any).sRGBEncoding;

    const mat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.DoubleSide,
    });

    // Чтобы картинка не растягивалась «криво», сделаем плоскость UV на весь диапазон
    const geo = new THREE.PlaneGeometry(width, height, 1, 1);
    // Стандартные UV от (0,0) до (1,1) нам подходят


    let ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;   // положим в XZ
    ground.position.y = -0.5;           // чуть ниже куба
    return ground;
}

function makeVerticalGradientTexture(topColor: string, bottomColor: string): THREE.CanvasTexture {
    const w = 2;      // достаточно узкий, т.к. интерполяция по X нам не нужна
    const h = 512;    // чем выше — тем плавнее градиент
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}