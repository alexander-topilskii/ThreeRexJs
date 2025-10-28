import type { Player } from './Player';
import type { ControlPanel } from './ui/ControlPanel';
import type { GameWorld } from './GameWorld';
import { checkDistance } from './physics_setup';
import { isInsideSphere } from './scene_setup';
import type { ConfettiSystem } from './effects/Confetti';

export class GameStatusManager {
    private player: Player;
    private controlPanel: ControlPanel;
    private world: GameWorld;
    private confetti: ConfettiSystem;
    private gameWon: boolean = false;
    private pickupDistance: number;

    constructor(
        player: Player,
        controlPanel: ControlPanel,
        world: GameWorld,
        confetti: ConfettiSystem,
        pickupDistance: number = 3
    ) {
        this.player = player;
        this.controlPanel = controlPanel;
        this.world = world;
        this.confetti = confetti;
        this.pickupDistance = pickupDistance;
    }

    update(): void {
        const distToCube = checkDistance(this.player.mesh, this.world.cube);
        const cubePos = this.world.cube.position;
        const spherePos = this.world.goalSphere.position;

        // Проверяем победу
        if (!this.gameWon && isInsideSphere(this.world.cube, this.world.goalSphere, this.world.goalSphereRadius)) {
            this.gameWon = true;
            this.controlPanel.setOutput('🎉 ВЫ ПОБЕДИЛИ! 🎉');
            this.confetti.burst(this.world.goalSphere.position.clone(), 150);
            return;
        }

        // Формируем вывод статуса
        let output = '';

        // Позиции объектов
        output += `Куб: x=${cubePos.x.toFixed(1)}, y=${cubePos.y.toFixed(1)}, z=${cubePos.z.toFixed(1)}\n`;
        output += `Сфера: x=${spherePos.x.toFixed(1)}, y=${spherePos.y.toFixed(1)}, z=${spherePos.z.toFixed(1)}\n`;

        // Обновляем кнопку взять/отпустить
        this.controlPanel.updatePickupButton(this.player.isCarrying);

        // Статус робота
        if (this.player.isCarrying) {
            output += `Вы держите куб (дистанция: ${distToCube.toFixed(2)}). Нажмите "Отпустить"`;
        } else if (distToCube < this.pickupDistance) {
            this.player.setNearbyPickupTarget(this.world.cube);
            output += `Рядом с кубом (дистанция: ${distToCube.toFixed(2)}). Нажмите "Взять"`;
        } else {
            this.player.setNearbyPickupTarget(null);
            const pos = this.player.getPosition();
            output += `Робот: x=${pos.x.toFixed(1)}, y=${pos.y.toFixed(1)}, z=${pos.z.toFixed(1)}`;
        }

        this.controlPanel.setOutput(output);
    }
}
