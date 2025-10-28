import * as THREE from 'three';
import type { OimoHelper } from './physics/OimoPhysics';

export interface PlayerOptions {
    position?: { x: number; y: number; z: number };
    size?: { width: number; height: number; depth: number };
    speed?: number;
    jumpForce?: number;
}

export class Player {
    mesh: THREE.Mesh;
    physics: OimoHelper;
    velocity: THREE.Vector3;

    private size: { width: number; height: number; depth: number };
    private speed: number;
    private jumpForce: number;
    private isGrounded: boolean = false;

    // Система переноса кубов
    private carriedObject: THREE.Object3D | null = null;
    private carryOffset: THREE.Vector3 = new THREE.Vector3(0, 0, -2);
    public isCarrying: boolean = false;

    constructor(physics: OimoHelper, options: PlayerOptions = {}) {
        this.physics = physics;
        this.velocity = new THREE.Vector3();

        // Параметры
        const pos = options.position || { x: 0, y: 2, z: 0 };
        this.size = options.size || { width: 0.8, height: 1.8, depth: 0.8 };
        this.speed = options.speed || 5;
        this.jumpForce = options.jumpForce || 8;

        // Создаем меш игрока (прямоугольный куб)
        const geometry = new THREE.BoxGeometry(this.size.width, this.size.height, this.size.depth);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.7
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(pos.x, pos.y, pos.z);

        // Добавляем в физику (масса = 5, больше чем у куба для корректных коллизий)
        this.physics.addMesh(this.mesh, 5);
    }

    // Движение в абсолютных направлениях (без учета камеры)
    moveForward(dt: number) {
        this.mesh.position.z -= this.speed * dt;
        this.physics.updateMesh?.(this.mesh);
    }

    moveBackward(dt: number) {
        this.mesh.position.z += this.speed * dt;
        this.physics.updateMesh?.(this.mesh);
    }

    moveLeft(dt: number) {
        this.mesh.position.x -= this.speed * dt;
        this.physics.updateMesh?.(this.mesh);
    }

    moveRight(dt: number) {
        this.mesh.position.x += this.speed * dt;
        this.physics.updateMesh?.(this.mesh);
    }

    jump() {
        if (this.isGrounded) {
            this.mesh.position.y += 0.5;
            this.physics.updateMesh?.(this.mesh);
        }
    }

    togglePickup() {
        if (this.isCarrying) {
            // Бросить объект
            if (this.carriedObject) {
                (this.carriedObject as any).isCarried = false;
                this.carriedObject = null;
                this.isCarrying = false;
            }
        } else {
            // Попытаться взять объект
            if ((this.mesh as any).nearbyPickupTarget) {
                this.carriedObject = (this.mesh as any).nearbyPickupTarget;
                (this.carriedObject as any).isCarried = true;
                this.isCarrying = true;
            }
        }
    }

    update(dt: number) {
        // Проверка на земле (упрощенная - проверяем высоту)
        this.isGrounded = this.mesh.position.y <= this.size.height / 2 + 0.1;

        // Обновляем позицию переносимого объекта
        if (this.carriedObject) {
            const carryPos = new THREE.Vector3(
                this.mesh.position.x,
                this.mesh.position.y + this.carryOffset.y,
                this.mesh.position.z + this.carryOffset.z
            );
            this.carriedObject.position.copy(carryPos);
            this.physics.updateMesh?.(this.carriedObject);
        }
    }

    setNearbyPickupTarget(target: THREE.Object3D | null) {
        (this.mesh as any).nearbyPickupTarget = target;
    }

    getPosition(): THREE.Vector3 {
        return this.mesh.position;
    }

    dispose() {
        // Убираем обработчики клавиш
    }
}
