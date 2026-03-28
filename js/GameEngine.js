import { Renderer } from "./core/renderer.js";
import { LangManager } from "./core/langManager.js";
import { InputManager } from "./core/inputManager.js";
import { UiManager } from "./core/uiManager.js";
import { SaveManager } from "./core/saveManager.js";
import { UpgradeManager } from "./managers/UpgradeManager.js";
import { EnemyBase } from "./entities/enemy/EnemyBase.js";
import { ObjectPool } from "./core/ObjectPool.js";


export class GameEngine {
    constructor() {
        this.saveManager = new SaveManager();
        this.langManager = new LangManager();
        this.renderer = new Renderer(this.langManager);
        this.inputManager = new InputManager();
        this.uiManager = new UiManager(this);
        this.upgradeManager = new UpgradeManager(this);

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
    }

    async changeGameLanguage(newLangCode) {
        await this.langManager.changeLanguage(newLangCode);

        this.renderer.updateScreenLanguage();
    }
}