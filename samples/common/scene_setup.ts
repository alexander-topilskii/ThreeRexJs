import * as THREE from 'three';

export interface WallsOptions {
    size: number;
    height: number;
    thickness: number;
    color: number;
    opacity: number;
    groundY?: number; // Уровень земли для правильного позиционирования
}

/**
 * Создает 4 стенки по краям плоскости
 * Стенки начинаются от уровня земли и идут вверх
 */
export function createWalls(options: WallsOptions): THREE.Mesh[] {
    const { size, height, thickness, color, opacity, groundY = 0 } = options;

    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity
    });

    const walls: THREE.Mesh[] = [];

    // Увеличиваем высоту стен чтобы они уходили в землю и не было зазоров
    const wallHeight = height + 1;
    const wallY = groundY + height / 2;

    // Северная стенка
    const wallNorth = new THREE.Mesh(
        new THREE.BoxGeometry(size + thickness * 2, wallHeight, thickness),
        material
    );
    wallNorth.position.set(0, wallY, -size / 2);
    walls.push(wallNorth);

    // Южная стенка
    const wallSouth = new THREE.Mesh(
        new THREE.BoxGeometry(size + thickness * 2, wallHeight, thickness),
        material
    );
    wallSouth.position.set(0, wallY, size / 2);
    walls.push(wallSouth);

    // Западная стенка
    const wallWest = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, wallHeight, size),
        material
    );
    wallWest.position.set(-size / 2, wallY, 0);
    walls.push(wallWest);

    // Восточная стенка
    const wallEast = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, wallHeight, size),
        material
    );
    wallEast.position.set(size / 2, wallY, 0);
    walls.push(wallEast);

    return walls;
}

/**
 * Создает невидимый коллайдер для ground
 */
export function createGroundCollider(
    size: number,
    thickness: number,
    groundY: number
): THREE.Mesh {
    const collider = new THREE.Mesh(
        new THREE.BoxGeometry(size, thickness, size),
        new THREE.MeshBasicMaterial({ visible: false })
    );
    collider.position.set(0, groundY - thickness / 2, 0);
    return collider;
}

export interface GoalSphereOptions {
    radius: number;
    position: { x: number; y: number; z: number };
    color?: number;
    opacity?: number;
}

/**
 * Создает полупрозрачную сферу-цель
 */
export function createGoalSphere(options: GoalSphereOptions): THREE.Mesh {
    const { radius, position, color = 0x00ff00, opacity = 0.3 } = options;

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        wireframe: false
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(position.x, position.y, position.z);

    return sphere;
}

/**
 * Проверяет, находится ли объект внутри сферы
 */
export function isInsideSphere(
    object: THREE.Object3D,
    sphere: THREE.Mesh,
    sphereRadius: number
): boolean {
    const distance = object.position.distanceTo(sphere.position);
    return distance <= sphereRadius;
}
