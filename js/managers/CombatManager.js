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
        // 1. LÖVEDÉKEK VIZSGÁLATA
        // ==========================================
        projectiles.forEach(projectile => {
            if (!projectile.isActive) return;

            if (projectile.isEnemyProjectile) {
                // --- A) ELLENSÉGES GOLYÓ VS JÁTÉKOS ---
                if (player.isActive &&
                    projectile.x < player.x + player.size &&
                    projectile.x + projectile.size > player.x &&
                    projectile.y < player.y + player.size &&
                    projectile.y + projectile.size > player.y) {

                        
                    player.takeDamage(projectile.damage);
                    this.engine.projectilePool.release(projectile);

                    // Szikrák, amikor a játékost eltalálják (Pajzs/HP színű, pl. pirosas)
                    this.engine.particleManager.createExplosion(
                        projectile.x, projectile.y, "#ff0044", 10, 150, 2, 4.0
                    );
                }
            } else {
                // --- B) JÁTÉKOS LÖVEDÉKE VS ELLENSÉG ---
                Object.values(this.engine.enemyPools).forEach(pool => {
                    pool.pool.forEach(enemy => {
                        if (!enemy.isActive || !projectile.isActive) return;

                        // Ütközés vizsgálata
                        const isColliding = projectile.x < enemy.x + enemy.size &&
                                            projectile.x + projectile.size > enemy.x &&
                                            projectile.y < enemy.y + enemy.size &&
                                            projectile.y + projectile.size > enemy.y;

                        if (projectile.movementType === "melee") {
                            if (isColliding) {
                                // Ha hozzáérünk, és még nem sebeztük meg ezen a "húzáson" belül
                                if (!projectile.hitTargets.has(enemy)) {
                                    projectile.hitTargets.add(enemy);
                                    enemy.takeDamage(projectile.damage);
                                    
                                    this.engine.particleManager.createExplosion(
                                        enemy.x + enemy.size/2, enemy.y + enemy.size/2, "#bc13fe", 10, 200, 3, 3.0
                                    );
                                }
                            } else {
                                // HA ELVISSZÜK RÓLA A KARDOT: elfelejtjük az ellenséget, hogy újra sebezhessük!
                                if (projectile.hitTargets.has(enemy)) {
                                    projectile.hitTargets.delete(enemy);
                                }
                            }
                        } 
                        else {
                            // Sima golyó és rakéta logika
                            if (isColliding) {
                                enemy.takeDamage(projectile.damage);
                                this.engine.projectilePool.release(projectile);

                                this.engine.particleManager.createExplosion(
                                    projectile.x, projectile.y, "#00f3ff", 8, 150, 2, 4.0
                                );
                            }
                        }
                    });
                });
            }
        });

        // ==========================================
        // 2. JÁTÉKOS VS ELLENSÉG (TEST-TEST ELLENI ÜTKÖZÉS)
        // ==========================================
        if (player.isActive) {
            Object.values(this.engine.enemyPools).forEach(pool => {
                pool.pool.forEach(enemy => {
                    if (!enemy.isActive) return;

                    if (player.x < enemy.x + enemy.size &&
                        player.x + player.size > enemy.x &&
                        player.y < enemy.y + enemy.size &&
                        player.y + player.size > enemy.y) {

                        player.takeDamage(enemy.hp);
                        console.log(`Ütközés! Játékos HP: ${player.hp} (Levonva: ${enemy.hp})`);

                        enemy.takeDamage(enemy.hp);

                        if (player.hp <= 0) {
                            player.isActive = false;
                            console.log("JÁTÉK VÉGE!");
                        }
                    }
                });
            });
        }
    }
}