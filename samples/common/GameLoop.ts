import * as THREE from 'three';
import type { PlayerController } from './player_utils';
import type { Player } from './Player';
import type { OimoHelper } from './physics/OimoPhysics';
import type { ConfettiSystem } from './effects/Confetti';
import type { GameStatusManager } from './GameStatusManager';
import type { CubeUISync } from './CubeUISync';

export interface GameLoopOptions {
    controller: PlayerController;
    player: Player;
    physics: OimoHelper;
    confetti: ConfettiSystem;
    statusManager: GameStatusManager;
    cubeUISync: CubeUISync;
    autoCheckbox: HTMLInputElement;
    infoElement: HTMLElement;
    cube: THREE.Mesh;
    getDataTextBlock: (pos: THREE.Vector3, rot: THREE.Euler) => string;
}

export class GameLoop {
    private prevTime: number = performance.now();
    private isRunning: boolean = false;
    private options: GameLoopOptions;

    constructor(options: GameLoopOptions) {
        this.options = options;
    }

    start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    stop(): void {
        this.isRunning = false;
    }

    private animate = (): void => {
        if (!this.isRunning) return;
        requestAnimationFrame(this.animate);

        const now = performance.now();
        const dt = (now - this.prevTime) / 1000;
        this.prevTime = now;

        // Update game systems
        this.options.controller.update(dt);
        this.options.player.update(dt);
        this.options.statusManager.update();
        this.options.confetti.update(dt);

        // Physics
        if (this.options.autoCheckbox.checked) {
            this.options.physics.step?.(dt);
        }

        // UI updates
        this.options.infoElement.innerHTML = this.options.getDataTextBlock(
            this.options.cube.position,
            this.options.cube.rotation
        );
        this.options.cubeUISync.update();
    }
}
