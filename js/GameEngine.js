import { Renderer } from "./core/renderer.js";

import { LangManager } from "./managers/langManager.js";
import { InputManager } from "./managers/inputManager.js";
import { UiManager } from "./managers/uiManager.js";
import { SaveManager } from "./managers/saveManager.js";
import { UpgradeManager } from "./managers/UpgradeManager.js";

import { EnemyBase } from "./entities/enemy/EnemyBase.js";
import { RangeEnemy } from "./entities/enemy/RangeEnemy.js";
import { Projectile } from "./entities/Projectile.js";
import { ObjectPool } from "./core/ObjectPool.js";

import { GameDirector } from "./core/GameDirector.js";
import { Player } from "./entities/Player.js";

import { Particle } from "./entities/particle.js";
import { ParticleManager } from "./managers/ParticleManager.js";


export class GameEngine {
    constructor() {
        this.saveManager = new SaveManager();
        this.particleManager = new ParticleManager(this);
        this.langManager = new LangManager();
        this.renderer = new Renderer(this);
        this.inputManager = new InputManager();
        this.uiManager = new UiManager(this);
        this.upgradeManager = new UpgradeManager(this);
        this.gameDirector = new GameDirector(this);

        this.player = new Player(this);

        this.enemyPools = {}

        this.projectilePool = new ObjectPool(Projectile, 200, this);
        this.particlePool = new ObjectPool(Particle, 500, this);
    }

    async start() {
        await this.langManager.loadLanguage();
        await this.saveManager.loadDatas();

        // --- 1. POOLOK ÉS STATOK DINAMIKUS GENERÁLÁSA ---
        this.initEnemyPools();
        this.particlePool.init();
        // ? this.projectilePool.init();

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

                if (this.gameDirector.gameMode) {
                    this.renderer.renderMinimap();
                }
            }

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    initEnemyPools() {
        // Lekérjük a datas.json "enemies" blokkját
        const enemyDatas = this.saveManager.gameData.enemies;

        for (const [enemyId, stats] of Object.entries(enemyDatas)) {

            let EnemyClass = EnemyBase; // Alapértelmezett, ha "melee"

            if (stats.type === 'range') {
                EnemyClass = RangeEnemy;
            }

            // Automatikusan létrejön a "basicPool", "swarmPool", "shooterPool" stb.
            this.enemyPools[`${enemyId}Pool`] = new ObjectPool(EnemyClass, 50, { engine: this, stats: stats });
        }

        // Inicializáljuk mindet
        Object.values(this.enemyPools).forEach(pool => pool.init());
        console.log("Generált enemy poolok:", this.enemyPools);
    }

    async changeGameLanguage(newLangCode) {
        await this.langManager.changeLanguage(newLangCode);

        this.renderer.updateScreenLanguage();
    }
}