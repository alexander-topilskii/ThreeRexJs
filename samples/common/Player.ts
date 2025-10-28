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
    private moveDirection: THREE.Vector3 = new THREE.Vector3();

    // Состояние клавиш
    private keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false
    };

    // Система переноса кубов
    private carriedObject: THREE.Object3D | null = null;
    private carryOffset: THREE.Vector3 = new THREE.Vector3(0, 0, -2);

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

        // Добавляем в физику (масса = 1)
        this.physics.addMesh(this.mesh, 1);

        // Биндим обработчики
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    private handleKeyDown(e: KeyboardEvent) {
        switch (e.code) {
            case 'KeyW': this.keys.forward = true; break;
            case 'KeyS': this.keys.backward = true; break;
            case 'KeyA': this.keys.left = true; break;
            case 'KeyD': this.keys.right = true; break;
            case 'Space': this.keys.jump = true; break;
            case 'KeyE': this.tryPickupOrDrop(); break;
        }
    }

    private handleKeyUp(e: KeyboardEvent) {
        switch (e.code) {
            case 'KeyW': this.keys.forward = false; break;
            case 'KeyS': this.keys.backward = false; break;
            case 'KeyA': this.keys.left = false; break;
            case 'KeyD': this.keys.right = false; break;
            case 'Space': this.keys.jump = false; break;
        }
    }

    private tryPickupOrDrop() {
        if (this.carriedObject) {
            // Бросить объект
            this.dropObject();
        } else {
            // Попытаться взять объект
            this.pickupObject();
        }
    }

    private pickupObject() {
        // Ищем объект перед игроком (простая проверка по расстоянию)
        // В реальном проекте здесь был бы raycast
        // Для простоты будем искать объекты с тегом, который добавим позже
        if ((this.mesh as any).nearbyPickupTarget) {
            this.carriedObject = (this.mesh as any).nearbyPickupTarget;
            (this.carriedObject as any).isCarried = true;
        }
    }

    private dropObject() {
        if (this.carriedObject) {
            (this.carriedObject as any).isCarried = false;
            this.carriedObject = null;
        }
    }

    update(dt: number, camera: THREE.Camera) {
        // Вычисляем направление движения относительно камеры
        this.moveDirection.set(0, 0, 0);

        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0; // Игнорируем вертикальную составляющую
        forward.normalize();

        const right = new THREE.Vector3();
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        if (this.keys.forward) this.moveDirection.add(forward);
        if (this.keys.backward) this.moveDirection.sub(forward);
        if (this.keys.left) this.moveDirection.sub(right);
        if (this.keys.right) this.moveDirection.add(right);

        this.moveDirection.normalize();

        // Применяем движение через физику
        if (this.moveDirection.length() > 0) {
            const targetVel = this.moveDirection.multiplyScalar(this.speed);
            this.mesh.position.add(targetVel.multiplyScalar(dt));
            this.physics.updateMesh?.(this.mesh);
        }

        // Прыжок
        if (this.keys.jump && this.isGrounded) {
            // Применяем импульс вверх
            this.mesh.position.y += 0.1;
            this.physics.updateMesh?.(this.mesh);
            this.keys.jump = false; // Один прыжок за нажатие
        }

        // Проверка на земле (упрощенная - проверяем высоту)
        this.isGrounded = this.mesh.position.y <= this.size.height / 2 + 0.1;

        // Обновляем позицию переносимого объекта
        if (this.carriedObject) {
            const carryPos = new THREE.Vector3();
            camera.getWorldDirection(carryPos);
            carryPos.multiplyScalar(this.carryOffset.z);
            carryPos.add(this.mesh.position);
            carryPos.y = this.mesh.position.y + this.carryOffset.y;

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
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }
}
