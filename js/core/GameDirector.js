import { WaveManager } from "../managers/WaveManager.js";
import { CombatManager } from "../managers/CombatManager.js";

export class GameDirector {
    constructor(engine) {
        this.engine = engine;
        this.currentState = "idle"; // idle, playing, paused, gameover
        this.gameMode = null; // normal, endless, etc.

        this.waveManager = new WaveManager(this.engine);
        this.combatManager = new CombatManager(this.engine);

        this.cameraFollowPlayer = false;
        this.mapWidth = 0;
        this.mapHeight = 0;
        this.score = 0;
    }

    init(gameMode = "normal") {
        this.gameMode = gameMode;
        console.log("Game mode:", this.gameMode);

        if (this.gameMode === "normal") {           // HA VÉGE A JÁTÉKNAK MINDEN ENEMYT, BULLLET-et DEALTIVÁLNI KELL!
            this.mapWidth = 10000;
            this.mapHeight = 10000;
            this.cameraFollowPlayer = true;
            this.waveManager.init();
        } else if (this.gameMode === "challenge") {
            this.mapWidth = window.innerWidth;
            this.mapHeight = window.innerHeight;
            this.cameraFollowPlayer = false;
            this.waveManager.init();


        }


        const startX = (this.mapWidth / 2) - this.engine.player.size / 2;
        const startY = (this.mapHeight / 2) - this.engine.player.size / 2;

        this.engine.player.init(startX, startY);
        this.waveManager.init();
    }


    update(deltaTime) {
        if (this.currentState === "playing") {
            this.engine.player.update(deltaTime);

            Object.values(this.engine.enemyPools).forEach(pool => {
                pool.pool.forEach(enemy => {
                    if (enemy.isActive) {
                        enemy.update(this.engine.player, deltaTime);

                        const worldMouseX = this.engine.inputManager.mouse.x // + (this.engine.renderer.camX || 0);
                        const worldMouseY = this.engine.inputManager.mouse.y // + (this.engine.renderer.camY || 0);

                        const isHovering = worldMouseX >= enemy.x &&
                            worldMouseX <= enemy.x + enemy.size &&
                            worldMouseY >= enemy.y &&
                            worldMouseY <= enemy.y + enemy.size;

                        if (isHovering && this.engine.inputManager.isMouseDown()) {
                            console.log("Kiválasztott Enemy adatai:", enemy);
                            this.engine.inputManager.mouse.pressed = false;
                        }
                    }
                });
            });

            this.engine.projectilePool.pool.forEach(projectile => {
                if (projectile.isActive) {
                    projectile.update(deltaTime);

                    if (projectile.x < 0 || projectile.x > this.engine.gameDirector.mapWidth ||
                        projectile.y < 0 || projectile.y > this.engine.gameDirector.mapHeight) {
                        projectile.isActive = false;
                    }
                }
            });

            this.combatManager.update(deltaTime);
            this.waveManager.update(deltaTime);
        }
    }

    spawnEnemy(poolName) {
        const pool = this.engine.enemyPools[poolName];
        if (!pool) return;

        const enemy = pool.get();

        const camX = this.engine.renderer.camX || 0;
        const camY = this.engine.renderer.camY || 0;
        const canvasW = this.engine.renderer.gameCanvas.width;
        const canvasH = this.engine.renderer.gameCanvas.height;
        
        const margin = 100; 
        
        let spawnX, spawnY;

        // 0: Fent, 1: Lent, 2: Baloldalt, 3: Jobboldalt
        const side = Math.floor(Math.random() * 4);

        if (side === 0) {
            // FENT: X bárhol lehet a kamera szélességében, Y a kamera fölött van
            spawnX = camX + Math.random() * canvasW;
            spawnY = camY - margin;
        } else if (side === 1) {
            // LENT: X bárhol lehet a kamera szélességében, Y a kamera alatt van
            spawnX = camX + Math.random() * canvasW;
            spawnY = camY + canvasH + margin;
        } else if (side === 2) {
            // BAL: X a kamerától balra van, Y bárhol lehet a kamera magasságában
            spawnX = camX - margin;
            spawnY = camY + Math.random() * canvasH;
        } else {
            // JOBB: X a kamerától jobbra van, Y bárhol lehet a kamera magasságában
            spawnX = camX + canvasW + margin;
            spawnY = camY + Math.random() * canvasH;
        }

        // 3. HATÁRVONALAK (Clamp) VIZSGÁLATA
        // Nagyon fontos: Ha a játékos a pálya legszélén áll, a fenti matek kivenne a pályáról.
        // Ezért biztosítjuk, hogy a spawnX és spawnY ne mehessen 0 alá, és ne lépje túl a térkép méretét!
        // Levonjuk az enemy.size-t, hogy maga az ellenség teste is belül maradjon.
        const eSize = enemy.size || 30;
        spawnX = Math.max(0, Math.min(spawnX, this.mapWidth - eSize));
        spawnY = Math.max(0, Math.min(spawnY, this.mapHeight - eSize));

        enemy.init(spawnX, spawnY);
    }

    changeState(newState) {
        this.currentState = newState;
    }

    startGame() {
        this.changeState("playing");
    }

    pauseGame() {
        this.changeState("paused");
    }

    endGame() {
        this.changeState("gameover");
    }

    resetGame() {
        this.changeState("idle");
    }
}