export class ParticleManager {
    constructor(engine) {
        this.engine = engine;
    }

    update(deltaTime) {
        // A GameEngine hivatalos poolját használjuk
        this.engine.particlePool.pool.forEach(p => {
            if (p.isActive) p.update(deltaTime);
        });
    }

    createExplosion(x, y, color, count, speed, size, lifeDecay) {
        for (let i = 0; i < count; i++) {
            // Elkérünk egy inaktív részecskét a poolból
            const p = this.engine.particlePool.get();
            
            // Beállítjuk a kezdeti értékeit
            p.init(x, y, color, speed, size, lifeDecay);
        }
    }
}