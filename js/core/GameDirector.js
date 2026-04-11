import { WaveManager } from "../managers/WaveManager.js";
import { CombatManager } from "../managers/CombatManager.js";
import { GameEngine } from "../GameEngine.js";

export class GameDirector {
    constructor(engine) {
        this.engine = engine;
        this.currentState = "idle"; // idle, playing, paused, gameover
        this.gameMode = null; // normal, endless, etc.

        this.waveManager = new WaveManager(this.engine);
        this.combatManager = new CombatManager(this.engine);

        this.cameraFollowPlayer = false;
        this.mapWidth = 0;

        // AZ AKTUÁLIS KÖR STATISZTIKÁI
        this.score = 0;
        this.coinsCollected = 0;
        this.enemiesKilled = 0; // ÚJ VÁLTOZÓ
    }

    init(gameMode = "normal") {
        this.gameMode = gameMode;
        console.log("Game mode:", this.gameMode);

        // FONTOS: Minden új kezdésnél nullázzuk a kör statisztikáit!
        this.score = 0;
        this.coinsCollected = 0;
        this.enemiesKilled = 0;

        if (this.gameMode === "normal") {           
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
            this.engine.particleManager.update(deltaTime);
            this.engine.renderer.update(deltaTime);
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

        const margin = 50;

        let spawnX, spawnY;

        // Véletlenszerű pont kiválasztása egy téglalap kerületén (kamera + margin)
        // 0: Fent, 1: Jobb, 2: Lent, 3: Bal
        const side = Math.floor(Math.random() * 4);

        if (side === 0) { // Fent
            spawnX = camX - margin + Math.random() * (canvasW + margin * 2);
            spawnY = camY - margin;
        } else if (side === 1) { // Jobb
            spawnX = camX + canvasW + margin;
            spawnY = camY - margin + Math.random() * (canvasH + margin * 2);
        } else if (side === 2) { // Lent
            spawnX = camX - margin + Math.random() * (canvasW + margin * 2);
            spawnY = camY + canvasH + margin;
        } else { // Bal
            spawnX = camX - margin;
            spawnY = camY - margin + Math.random() * (canvasH + margin * 2);
        }

        const eSize = enemy.size || 30;
        if (spawnX < 0 || spawnX > this.mapWidth - eSize || spawnY < 0 || spawnY > this.mapHeight - eSize) {
            enemy.isActive = false;
            return;
        }

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
        this.engine.projectilePool.pool.forEach(p => p.isActive = false);
        Object.values(this.engine.enemyPools).forEach(pool => {
            pool.pool.forEach(enemy => enemy.isActive = false);
        });
        Object.values(this.engine.particlePool.pool).forEach(particle => particle.isActive = false);

        this.engine.player.isActive = false;

        // 1. Töltsük be a Game Over képernyőt
        this.engine.renderer.loadScreen('tpl-gameover-menu');

        // 2. KIKERESSÜK AZ ELEMEKET ÉS BETÖLTJÜK A KÖR ADATAIT
        const scoreElement = document.getElementById('gameover-score');
        const killsElement = document.getElementById('gameover-kills');
        const coinsElement = document.getElementById('gameover-coins');
        const badgeElement = document.getElementById('new-highscore-badge');

        if (scoreElement) scoreElement.textContent = this.score.toString().padStart(6, '0');
        if (killsElement) killsElement.textContent = this.enemiesKilled; // Ölések száma
        if (coinsElement) coinsElement.textContent = this.coinsCollected; // Pénz mennyisége

        // Új rekord ellenőrzése
        if (this.score >= this.engine.saveManager.saveState.highScore && this.score > 0) {
            if (badgeElement) {
                badgeElement.style.display = "block";
                badgeElement.style.opacity = "1";
                badgeElement.style.visibility = "visible";
            }
        }

        this.engine.uiManager.setupEventListeners();
    }

    resetGame() {
        this.changeState("idle");
    }
}