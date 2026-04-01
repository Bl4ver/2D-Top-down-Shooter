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
            this.mapWidth = 1920;
            this.mapHeight = 1080;
            this.cameraFollowPlayer = false;

            console.log(this.engine.enemyPools.basicEnemyPool.get())
            // this.engine.enemyPools.basicEnemyPool.get().init(10, 10)
        }

        
        const startX = (this.mapWidth / 2) - this.engine.player.size / 2;
        const startY = (this.mapHeight / 2) - this.engine.player.size / 2;

        this.engine.player.init(startX, startY);
        this.waveManager.init();
    }


   update(deltaTime) {
        if (this.currentState === "playing") {
            this.engine.player.update(deltaTime);
            this.waveManager.update(deltaTime)
            
            if (Math.random() < 0.05) {
                console.log(`Játékos pozíció: X=${this.engine.player.x}, Y=${this.engine.player.y}`);
            }
        }
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