import { WaveManager } from "../managers/WaveManager.js";

export class GameDirector {
    constructor(engine) {
        this.engine = engine;
        this.currentState = "idle"; // idle, playing, paused, gameover
        this.gameMode = null; // normal, endless, etc.

        this.waveManager = new WaveManager(this.engine);

        this.cameraFollowPlayer = false;
        this.mapWidth = 0;
        this.mapHeight = 0;
    }

    init(gameMode = "normal") {
        this.gameMode = gameMode;
        console.log("Game mode:", this.gameMode);

        if (this.gameMode === "normal") {
            this.mapWidth = 10000;
            this.mapHeight = 10000;
            this.cameraFollowPlayer = true;
        } else if (this.gameMode === "challenge") {
            this.mapWidth = window.innerWidth;
            this.mapHeight = window.innerHeight;
            this.cameraFollowPlayer = false;


            console.log(this.engine.enemyPools.basicEnemyPool.get())
            this.engine.enemyPools.basicEnemyPool.get().init(10, 10)
        }


        const startX = (this.mapWidth / 2) - this.engine.player.size / 2;
        const startY = (this.mapHeight / 2) - this.engine.player.size / 2;

        this.engine.player.init(startX, startY);
        this.waveManager.init();

        for (let i = 0; i < 5; i++) {
            this.spawnEnemy('basicEnemyPool');
        }
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
        }
    }

    spawnEnemy(poolName) {
        const pool = this.engine.enemyPools[poolName];
        if (!pool) return;

        const enemy = pool.get();

        const randomX = Math.random() * this.mapWidth;
        const randomY = Math.random() * this.mapHeight;

        enemy.init(randomX, randomY);
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