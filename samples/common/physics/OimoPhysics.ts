import * as THREE from 'three';

// Minimal wrapper that mimics three/examples/jsm/physics/OimoPhysics API
// using the npm package "oimo". Only implements what's needed by our samples:
// - addMesh(mesh, mass)
// - step(dt)
// Supports BoxGeometry meshes (our cube and ground collider).

// We import OIMO dynamically to avoid types issues; it's bundled by Vite.
export async function OimoPhysics() {
  const OIMO: any = await import('oimo');

  const world = new OIMO.World({
    timestep: 1/60,
    broadphase: 2,
    worldscale: 1,
    rand: true,
    info: false,
    gravity: [0, -9.8, 0],
  });

  type BodyRecord = { mesh: THREE.Object3D; body: any; syncRotation: boolean };
  const records: BodyRecord[] = [];

  function radToDeg(r: number) { return r * 180 / Math.PI; }

  function addMesh(mesh: THREE.Object3D, mass: number) {
    // Determine size. We support BoxGeometry or explicit bounding box.
    let size: [number, number, number] = [1, 1, 1];
    let syncRotation = true;

    if ((mesh as any).geometry && (mesh as any).geometry instanceof THREE.BoxGeometry) {
      const params = (mesh as any).geometry.parameters;
      size = [params.width ?? 1, params.height ?? 1, params.depth ?? 1];
    } else {
      // Compute bbox as fallback
      const bbox = new THREE.Box3().setFromObject(mesh);
      const v = new THREE.Vector3();
      bbox.getSize(v);
      size = [v.x || 1, v.y || 1, v.z || 1];
    }

    // Rotation in degrees for OIMO
    const rotDeg: [number, number, number] = [
      radToDeg((mesh as any).rotation?.x || 0),
      radToDeg((mesh as any).rotation?.y || 0),
      radToDeg((mesh as any).rotation?.z || 0),
    ];

    const isDynamic = mass > 0;

    const body = world.add({
      type: 'box',
      size,
      pos: [mesh.position.x, mesh.position.y, mesh.position.z],
      rot: rotDeg,
      move: isDynamic,
      density: mass || 1,
      friction: 0.8,
      restitution: 0.2,
    });

    // Keep initial transform in sync
    // For static bodies we won't need to sync rotation every frame
    records.push({ mesh, body, syncRotation: isDynamic });
  }

  // Accumulator for stable stepping to reduce tunneling through thin colliders
  let acc = 0;
  const fixed = 1/60; // match world timestep

  function step(dt?: number) {
    const dtValid = dt && isFinite(dt as number) && (dt as number) > 0 ? (dt as number) : fixed;
    // Clamp excessively large frame times to avoid huge catch-ups
    const dtClamped = Math.min(dtValid, 1/30); // ~33ms max per frame (tighter clamp reduces tunneling)
    acc += dtClamped;

    // Cap accumulator to avoid spiral of death
    const maxCatchup = fixed * 8;
    if (acc > maxCatchup) acc = maxCatchup;

    // Perform up to 8 substeps to catch up
    let steps = 0;
    while (acc >= fixed && steps < 8) {
      world.step();
      acc -= fixed;
      steps++;
    }

    // Sync meshes from bodies
    for (const r of records) {
      const p = r.body.getPosition();
      r.mesh.position.set(p.x, p.y, p.z);
      const q = r.body.getQuaternion();
      (r.mesh as any).quaternion.set(q.x, q.y, q.z, q.w);
    }
  }

  return { addMesh, step };
}

export type OimoHelper = Awaited<ReturnType<typeof OimoPhysics>>;
