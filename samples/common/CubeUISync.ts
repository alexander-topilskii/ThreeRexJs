import type { OimoHelper } from './physics/OimoPhysics';
import type * as THREE from 'three';
import { updateCubePositionText, updateCubeRotationText } from './html_utils';

export class CubeUISync {
    private cube: THREE.Mesh;
    private panel: any;
    private physics: OimoHelper;

    constructor(cube: THREE.Mesh, panel: any, physics: OimoHelper) {
        this.cube = cube;
        this.panel = panel;
        this.physics = physics;

        this.setupEventListeners();
        this.syncUIFromCube();
    }

    private syncUIFromCube(): void {
        (this.cube as any).grabPositionTo(this.panel.positions);
        (this.cube as any).grabRotationTo(this.panel.rotations);
        this.panel.updatePositions(this.panel.positions);
        this.panel.updateRotation(this.panel.rotations);
    }

    private setupEventListeners(): void {
        // Position handlers
        [this.panel.positions.x, this.panel.positions.y, this.panel.positions.z].forEach((s) => {
            s.addEventListener('input', () => {
                updateCubePositionText(this.panel, this.cube.position);
                this.physics.updateMesh?.(this.cube);
            });
        });

        // Rotation handlers
        [this.panel.rotations.x, this.panel.rotations.y, this.panel.rotations.z].forEach((s) => {
            s.addEventListener('input', () => {
                updateCubeRotationText(this.panel, this.cube.rotation);
                this.physics.updateMesh?.(this.cube);
            });
        });
    }

    update(): void {
        this.syncUIFromCube();
    }
}
