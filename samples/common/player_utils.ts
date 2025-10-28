import * as THREE from 'three';

export type PlayerControllerOptions = {
  mouseSensitivity?: number; // radians per pixel
  moveSpeed?: number;        // units per second
  verticalSpeed?: number;    // units per second for Q/E
  initialYaw?: number;       // radians
  initialPitch?: number;     // radians
  initialPosition?: THREE.Vector3 | { x: number; y: number; z: number };
  clampPitch?: number;       // max abs pitch (default PI/2 - 0.01)
};

export type PlayerController = {
  update: (dt: number) => void;
  dispose: () => void;
  enabled: boolean;
  state: {
    yaw: number;
    pitch: number;
    keys: Set<string>;
  };
};

/**
 * Creates a simple FPS/isometric style player controller:
 * - Pointer Lock mouse look (click the provided domElement to lock)
 * - WASD strafing relative to yaw, Q/E for vertical movement
 * - Call controller.update(dt) every frame
 */
export function createPlayerController(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
  options: PlayerControllerOptions = {}
): PlayerController {
  const mouseSensitivity = options.mouseSensitivity ?? 0.0025;
  const moveSpeed = options.moveSpeed ?? 4;
  const verticalSpeed = options.verticalSpeed ?? 4;
  const clampPitch = options.clampPitch ?? Math.PI / 2 - 0.01;

  const keys = new Set<string>();
  let yaw = options.initialYaw ?? 0;
  let pitch = options.initialPitch ?? 0;
  let enabled = true;

  // Init camera orientation and position
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  if (options.initialPosition) {
    const p = options.initialPosition as any;
    camera.position.set(p.x, p.y, p.z);
  }

  const tmpMove = new THREE.Vector3();

  // Pointer lock start on click
  const onClick = () => {
    if (enabled) domElement.requestPointerLock();
  };
  domElement.addEventListener('click', onClick);

  // Mouse look while locked
  const onMouseMove = (e: MouseEvent) => {
    if (!enabled || document.pointerLockElement !== domElement) return;
    yaw   -= e.movementX * mouseSensitivity;
    pitch -= e.movementY * mouseSensitivity;
    if (pitch > clampPitch) pitch = clampPitch;
    if (pitch < -clampPitch) pitch = -clampPitch;
  };
  document.addEventListener('mousemove', onMouseMove);

  // Keyboard
  const onKeyDown = (e: KeyboardEvent) => { keys.add(e.code); };
  const onKeyUp = (e: KeyboardEvent) => { keys.delete(e.code); };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  function update(dt: number) {
    if (!enabled) return;

    // Apply mouse look
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    // Movement in XZ plane by yaw
    tmpMove.set(0, 0, 0);
    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);

    if (keys.has('KeyW')) { tmpMove.x -= sinY; tmpMove.z -= cosY; }
    if (keys.has('KeyS')) { tmpMove.x += sinY; tmpMove.z += cosY; }
    if (keys.has('KeyA')) { tmpMove.x -= cosY; tmpMove.z += sinY; }
    if (keys.has('KeyD')) { tmpMove.x += cosY; tmpMove.z -= sinY; }

    if (tmpMove.lengthSq() > 0) {
      tmpMove.normalize().multiplyScalar(moveSpeed * dt);
      camera.position.add(tmpMove);
    }

    let vY = 0;
    if (keys.has('KeyE')) vY += 1;
    if (keys.has('KeyQ')) vY -= 1;
    if (vY !== 0) camera.position.y += vY * verticalSpeed * dt;
  }

  function dispose() {
    domElement.removeEventListener('click', onClick);
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  }

  const controller = {
    update,
    dispose,
    get enabled() { return enabled; },
    set enabled(val: boolean) { enabled = val; },
    state: { yaw, pitch, keys }
  };

  return controller;
}
