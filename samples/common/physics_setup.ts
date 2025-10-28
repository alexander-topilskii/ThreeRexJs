import * as THREE from 'three';
import type { OimoHelper } from './physics/OimoPhysics';

/**
 * Добавляет массив мешей в физику как статические объекты
 */
export function addStaticMeshes(physics: OimoHelper, meshes: THREE.Mesh[]): void {
    meshes.forEach(mesh => physics.addMesh(mesh, 0));
}

/**
 * Добавляет меш в физику как динамический объект
 */
export function addDynamicMesh(physics: OimoHelper, mesh: THREE.Mesh, mass: number = 1): void {
    physics.addMesh(mesh, mass);
}

/**
 * Проверяет расстояние между двумя объектами
 */
export function checkDistance(obj1: THREE.Object3D, obj2: THREE.Object3D): number {
    return obj1.position.distanceTo(obj2.position);
}
