

export interface Updatable {

    start(): void
    update(dt: number): void;
    stop(): void
}

export class GameLoopManager {
    private prevTime: number = performance.now();
    private isRunning: boolean = false;
    private updatables: Array<Updatable>;

    constructor(updatables: Array<Updatable> = Array()) {
        this.updatables = updatables;
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
        this.updatables.forEach(u => u.update(dt));
    }
}
