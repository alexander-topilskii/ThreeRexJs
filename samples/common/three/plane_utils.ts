import * as THREE from "three";
import {Mesh, Vector3} from "three";


export class Plane {

    grid: THREE.GridHelper
    plane: Mesh

    constructor(
        position: Vector3 = new Vector3(0, 0, 0),
        width: number = 4000,
        height: number = 4000,
        gridColors: { top: string; bottom: string } = {top: '#e22fd9', bottom: '#8ef645'},
        planeColors: { top: string; bottom: string } = {top: '#2f74e2', bottom: '#0b1021'}
    ) {
        this.grid = this.createGrid(width, height, position, gridColors)
        this.plane = this.createGradientPlane(width, height, position, planeColors)
    }

    createGrid(
        width: number,
        height: number,
        position: Vector3,
        colors: {
            top: string;
            bottom: string
        }
    ) {
        let gridHelper = new THREE.GridHelper(width, height, colors.top, colors.bottom);
        gridHelper.position.x = position.x;
        gridHelper.position.y = position.y + 0.01;
        gridHelper.position.z = position.z;
        return gridHelper
    }

    createGradientPlane(
        width: number,
        height: number,
        position: Vector3,
        colors: { top: string; bottom: string }
    ) {
        const tex = this.makeVerticalGradientTexture(colors.top, colors.bottom);

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
        // ground.rotation.x = -Math.PI / 2;   // положим в XZ
        ground.position.x = position.x;
        ground.position.y = position.y + 0.001;
        ground.position.z = position.z;
        return ground;
    }

    makeVerticalGradientTexture(topColor: string, bottomColor: string): THREE.CanvasTexture {
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
}