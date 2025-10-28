import * as THREE from 'three';

interface ConfettiParticle {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    angularVelocity: THREE.Vector3;
    lifetime: number;
    maxLifetime: number;
}

export class ConfettiSystem {
    private particles: ConfettiParticle[] = [];
    private scene: THREE.Scene;
    private colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xff8800, 0xff0088];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    /**
     * Создает взрыв конфетти из указанной позиции
     */
    burst(position: THREE.Vector3, count: number = 100): void {
        for (let i = 0; i < count; i++) {
            const particle = this.createParticle(position);
            this.particles.push(particle);
            this.scene.add(particle.mesh);
        }
    }

    private createParticle(position: THREE.Vector3): ConfettiParticle {
        // Случайная форма (кубик или плоский прямоугольник)
        const isFlat = Math.random() > 0.5;
        const width = 0.1 + Math.random() * 0.1;
        const height = 0.1 + Math.random() * 0.1;
        const depth = isFlat ? 0.02 : 0.1 + Math.random() * 0.1;

        const geometry = new THREE.BoxGeometry(width, height, depth);

        // Случайный цвет
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const material = new THREE.MeshBasicMaterial({ color });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);

        // Случайная начальная скорость (взрыв в разные стороны)
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            Math.random() * 8 + 5, // Вверх
            (Math.random() - 0.5) * 10
        );

        // Случайная угловая скорость
        const angularVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );

        const maxLifetime = 3 + Math.random() * 2; // 3-5 секунд

        return {
            mesh,
            velocity,
            angularVelocity,
            lifetime: 0,
            maxLifetime
        };
    }

    /**
     * Обновляет систему частиц
     */
    update(dt: number): void {
        const gravity = new THREE.Vector3(0, -9.8, 0);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];

            // Обновляем время жизни
            particle.lifetime += dt;

            // Удаляем мертвые частицы
            if (particle.lifetime >= particle.maxLifetime) {
                this.scene.remove(particle.mesh);
                particle.mesh.geometry.dispose();
                (particle.mesh.material as THREE.Material).dispose();
                this.particles.splice(i, 1);
                continue;
            }

            // Применяем гравитацию
            particle.velocity.add(gravity.clone().multiplyScalar(dt));

            // Обновляем позицию
            particle.mesh.position.add(particle.velocity.clone().multiplyScalar(dt));

            // Обновляем вращение
            particle.mesh.rotation.x += particle.angularVelocity.x * dt;
            particle.mesh.rotation.y += particle.angularVelocity.y * dt;
            particle.mesh.rotation.z += particle.angularVelocity.z * dt;

            // Затухание (fade out)
            const lifetimeRatio = particle.lifetime / particle.maxLifetime;
            const opacity = 1 - lifetimeRatio;
            (particle.mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
            (particle.mesh.material as THREE.MeshBasicMaterial).transparent = true;

            // Замедление
            particle.velocity.multiplyScalar(0.98);
        }
    }

    /**
     * Очищает все частицы
     */
    clear(): void {
        for (const particle of this.particles) {
            this.scene.remove(particle.mesh);
            particle.mesh.geometry.dispose();
            (particle.mesh.material as THREE.Material).dispose();
        }
        this.particles = [];
    }

    /**
     * Получить количество активных частиц
     */
    getParticleCount(): number {
        return this.particles.length;
    }
}
