import * as THREE from 'three';
import { createGradientPlane, createGrid } from './plane_helpers';
import { createWalls, createGroundCollider, createGoalSphere } from './scene_setup';
import { createCube } from './three_utils';
import type { OimoHelper } from './physics/OimoPhysics';
import { addStaticMeshes, addDynamicMesh } from './physics_setup';

export interface GameWorldOptions {
    groundSize?: number;
    wallHeight?: number;
    wallThickness?: number;
    goalPosition?: { x: number; y: number; z: number };
}

export class GameWorld {
    scene: THREE.Scene;
    ground: THREE.Mesh;
    cube: THREE.Mesh;
    goalSphere: THREE.Mesh;
    goalSphereRadius: number;

    private groundSize: number;
    private walls: THREE.Mesh[] = [];

    constructor(scene: THREE.Scene, physics: OimoHelper, options: GameWorldOptions = {}) {
        this.scene = scene;
        this.groundSize = options.groundSize || 40;
        const wallHeight = options.wallHeight || 2;
        const wallThickness = options.wallThickness || 2.0;
        const cubeSize = 1;

        // Ground
        this.ground = createGradientPlane(this.groundSize, this.groundSize);
        scene.add(this.ground);

        const grid = createGrid(this.groundSize, this.groundSize, this.ground.position);
        scene.add(grid);

        // Ground collider
        const groundCollider = createGroundCollider(this.groundSize, 2.0, this.ground.position.y);
        scene.add(groundCollider);

        // Walls
        this.walls = createWalls({
            size: this.groundSize,
            height: wallHeight,
            thickness: wallThickness,
            color: 0x4488ff,
            opacity: 0.3,
            groundY: this.ground.position.y
        });
        this.walls.forEach(wall => scene.add(wall));

        // Cube
        this.cube = createCube();
        scene.add(this.cube);

        // Goal sphere
        this.goalSphereRadius = cubeSize * 2;
        const goalPos = options.goalPosition || { x: -10, y: this.ground.position.y, z: -10 };
        this.goalSphere = createGoalSphere({
            radius: this.goalSphereRadius,
            position: goalPos,
            color: 0xffff00,
            opacity: 0.3
        });
        scene.add(this.goalSphere);

        // Physics
        addStaticMeshes(physics, [groundCollider, ...this.walls]);
        addDynamicMesh(physics, this.cube, 1);
    }

    getGroundY(): number {
        return this.ground.position.y;
    }
}
