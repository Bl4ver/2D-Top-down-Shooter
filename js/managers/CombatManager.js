export class CombatManager {
    constructor(engine) {
        this.engine = engine;
    }

    update(deltaTime) {
        if (this.engine.inputManager.isMouseDown()) {
            const camX = this.engine.renderer.camX || 0;
            const camY = this.engine.renderer.camY || 0;

            const worldMouseX = this.engine.inputManager.mouse.x + camX;
            const worldMouseY = this.engine.inputManager.mouse.y + camY;

            this.engine.player.shoot(worldMouseX, worldMouseY);
        }

        this.checkCollisions();
    }

    checkCollisions() {
        const projectiles = this.engine.projectilePool.pool;
        const player = this.engine.player;

        // ==========================================
        // 1. GOLYÓ VS ELLENSÉG
        // ==========================================
        projectiles.forEach(projectile => {
            if (!projectile.isActive) return;

            Object.values(this.engine.enemyPools).forEach(pool => {
                pool.pool.forEach(enemy => {
                    if (!enemy.isActive || !projectile.isActive) return;

                    // --- AABB ÜTKÖZÉSVIZSGÁLAT ---
                    if (projectile.x < enemy.x + enemy.size &&
                        projectile.x + projectile.size > enemy.x &&
                        projectile.y < enemy.y + enemy.size &&
                        projectile.y + projectile.size > enemy.y) {

                        enemy.takeDamage(projectile.damage);
                        this.engine.projectilePool.release(projectile);
                    }
                });
            });
        });

        // ==========================================
        // 2. JÁTÉKOS VS ELLENSÉG
        // ==========================================
        if (player.isActive) {
            Object.values(this.engine.enemyPools).forEach(pool => {
                pool.pool.forEach(enemy => {
                    if (!enemy.isActive) return;

                    // --- AABB ÜTKÖZÉSVIZSGÁLAT ---
                    if (player.x < enemy.x + enemy.size &&
                        player.x + player.size > enemy.x &&
                        player.y < enemy.y + enemy.size &&
                        player.y + player.size > enemy.y) {

                        // 1. Levonjuk az ellenség AKTUÁLIS HP-ját a játékostól
                        player.takeDamage(enemy.hp);
                        console.log(`Ütközés! Játékos HP: ${player.hp} (Levonva: ${enemy.hp})`);

                        // 2. Az ellenség azonnal megsemmisül az ütközéstől
                        pool.release(enemy);

                        // 3. Játékos halálának vizsgálata
                        if (player.hp <= 0) {
                            player.isActive = false;
                            console.log("JÁTÉK VÉGE!");
                            // this.engine.gameDirector.endGame();
                        }
                    }
                });
            });
        }
    }
}