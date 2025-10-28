import * as THREE from 'three';

export interface WallsOptions {
    size: number;
    height: number;
    thickness: number;
    color: number;
    opacity: number;
}

/**
 * Создает 4 стенки по краям плоскости
 */
export function createWalls(options: WallsOptions): THREE.Mesh[] {
    const { size, height, thickness, color, opacity } = options;

    const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity
    });

    const walls: THREE.Mesh[] = [];

    // Северная стенка
    const wallNorth = new THREE.Mesh(
        new THREE.BoxGeometry(size, height, thickness),
        material
    );
    wallNorth.position.set(0, height / 2, -size / 2);
    walls.push(wallNorth);

    // Южная стенка
    const wallSouth = new THREE.Mesh(
        new THREE.BoxGeometry(size, height, thickness),
        material
    );
    wallSouth.position.set(0, height / 2, size / 2);
    walls.push(wallSouth);

    // Западная стенка
    const wallWest = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, height, size),
        material
    );
    wallWest.position.set(-size / 2, height / 2, 0);
    walls.push(wallWest);

    // Восточная стенка
    const wallEast = new THREE.Mesh(
        new THREE.BoxGeometry(thickness, height, size),
        material
    );
    wallEast.position.set(size / 2, height / 2, 0);
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
