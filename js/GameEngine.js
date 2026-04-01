import { Renderer } from "./core/renderer.js";
import { LangManager } from "./managers/langManager.js";
import { InputManager } from "./managers/inputManager.js";
import { UiManager } from "./managers/uiManager.js";
import { SaveManager } from "./managers/saveManager.js";
import { UpgradeManager } from "./managers/UpgradeManager.js";
import { EnemyBase } from "./entities/enemy/EnemyBase.js";
import { ObjectPool } from "./core/ObjectPool.js";
import { GameDirector } from "./core/GameDirector.js";
import { Player } from "./entities/player.js";  //Player.js ??


export class GameEngine {
    constructor() {
        this.saveManager = new SaveManager();
        this.langManager = new LangManager();
        this.renderer = new Renderer(this);
        this.inputManager = new InputManager();
        this.uiManager = new UiManager(this);
        this.upgradeManager = new UpgradeManager(this);
        this.gameDirector = new GameDirector(this);

        this.player = new Player(this);

        this.enemyPools = {
            basicEnemyPool: new ObjectPool(EnemyBase, 100),
            fastEnemyPool: new ObjectPool(EnemyBase, 100),
        }
    }

    async start() {
        await this.langManager.loadLanguage();
        await this.saveManager.loadDatas();
        this.uiManager.init();
        this.renderer.loadScreen('tpl-main-menu');
        this.upgradeManager.init();

        this.player.init();

        let lastTime = performance.now();
        const loop = (currentTime) => {
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            // 1. LOGIKA FRISSÍTÉSE
            this.gameDirector.update(deltaTime);

            // 2. KÉPERNYŐ RAJZOLÁSA
            if (this.gameDirector.currentState === "playing") {
                this.renderer.renderEntities();
            }

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
        this.renderer.loadScreen('tpl-main-menu'); // Menü megjelenítése
    }

    async changeGameLanguage(newLangCode) {
        await this.langManager.changeLanguage(newLangCode);

        this.renderer.updateScreenLanguage();
    }
}