import * as THREE from 'three';
import { getDataTextBlock, getInfoBlock } from '../../../common/html_utils';
import { getPerspectiveCamera } from '../../../common/three/three_utils';
import { OimoPhysics } from '../../../common/physics/OimoPhysics';
import { createTransformPanel } from '../../../common/panel_utils';
import { createPlayerController } from '../../../common/player_utils';
import { Player } from '../../../common/Player';
import { ControlPanel } from '../../../common/ui/ControlPanel';
import { ConfettiSystem } from '../../../common/effects/Confetti';
import { GameWorld } from '../../../common/GameWorld';
import { GameStatusManager } from '../../../common/GameStatusManager';
import { CubeUISync } from '../../../common/CubeUISync';
import { GameLoop } from '../../../common/GameLoop';
import { ChatGPTCommandService } from '../../../common/services/ChatGPTCommandService';

// === Константы ===
const GROUND_SIZE = 40;
const WALL_HEIGHT = 2;
const PICKUP_DISTANCE = 3;

// === Сцена и рендерер ===
const scene = new THREE.Scene();
const camera = getPerspectiveCamera();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Камера ===
const controller = createPlayerController(camera, renderer.domElement, {
    initialPosition: { x: 0, y: 2.5, z: 6 },
    initialPitch: -0.35,
});

// Оборачиваем в async функцию для избежания top-level await
(async () => {
    // === Физика ===
    const physics = await OimoPhysics();

    // === Игровой мир ===
    const world = new GameWorld(scene, physics, {
        groundSize: GROUND_SIZE,
        wallHeight: WALL_HEIGHT,
        wallThickness: 2.0,
        goalPosition: { x: -10, y: 0, z: -10 }
    });

    // === Игрок ===
    const player = new Player(physics, {
        position: { x: 5, y: 1, z: 5 },
        speed: 5,
        jumpForce: 8
    });
    scene.add(player.mesh);

    // === Эффекты ===
    const confetti = new ConfettiSystem(scene);

    // === ChatGPT сервис ===
    const chatService = new ChatGPTCommandService();

    // === UI ===
    const controlPanel = new ControlPanel(player, {
        chatService,
        onRequestCommands: async () => {
            const userMessage = controlPanel.getUserMessage();
            const gameState = {
                robotPosition: player.getPosition(),
                cubePosition: world.cube.position,
                spherePosition: world.goalSphere.position,
                isCarryingCube: player.isCarrying
            };

            const commands = await chatService.generateCommands(gameState, userMessage);
            controlPanel.addCommands(commands);
        }
    });
    controlPanel.mount();

    const info = getInfoBlock();
    const panel = createTransformPanel();
    const auto = panel.querySelector('#auto') as HTMLInputElement;
    document.body.appendChild(info);

    // === Менеджеры ===
    const statusManager = new GameStatusManager(player, controlPanel, world, confetti, PICKUP_DISTANCE);
    const cubeUISync = new CubeUISync(world.cube, panel, physics);

    // === Игровой цикл ===
    const gameLoop = new GameLoop({
        controller,
        player,
        physics,
        confetti,
        statusManager,
        cubeUISync,
        autoCheckbox: auto,
        infoElement: info,
        cube: world.cube,
        getDataTextBlock
    });

    gameLoop.start();

    // === Обработчики событий ===
    window.addEventListener('beforeunload', () => {
        controller.dispose();
        player.dispose();
        controlPanel.dispose();
        confetti.clear();
        gameLoop.stop();
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();

// Добавляем рендеринг в игровой цикл
(function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
})();
