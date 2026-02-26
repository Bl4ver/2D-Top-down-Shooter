import { State } from './State.js';
import { UIManager } from './core/UIManager.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { StatisticsScene } from './scenes/StatisticsScene.js';

export class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = new State();
        this.uiManager = new UIManager();
        this.currentSceneName = null;
        this.previousSceneName = null;
    }

    // 1. A döntéshozó: String alapján eldönti, melyik osztályt kell betölteni
    changeScene(sceneName) {
        let nextScene = null

        if (sceneName === 'back') {
            sceneName = this.previousSceneName || 'menu';
        }

        switch (sceneName) {
            case 'menu':
                nextScene = new MenuScene(this);
                break;
            case 'game':
                nextScene = new GameScene(this);
                break;
            case 'upgrades':
                // nextScene = new UpgradeScene(this);
                break;
            case 'statistics':
                nextScene = new StatisticsScene(this);
                break;
            case 'encyclopedia':
                // nextScene = new UpgradeScene(this);
                break;
            case 'settings':
                nextScene = new SettingsScene(this);
                break;
        }

        console.log(nextScene)
        if (nextScene) {
            this.previousSceneName = this.currentSceneName;
            this.currentSceneName = sceneName;
            this.setScene(nextScene);
            console.log("Scene megváltoztatva: " + sceneName);
        }
    }

    // 2. A végrehajtó: Levezényli az átállást
    setScene(newScene) {
        // TAKARÍTÁS: Ha volt előző jelenet, szólunk neki, hogy álljon le (pl. mentés, hangok leállítása)
        if (this.currentScene && this.currentScene.exit) {
            this.currentScene.exit();
        }

        // CSERE: Beállítjuk az új jelenetet
        this.lastScene = this.currentScene;
        this.currentScene = newScene;

        // ELINDÍTÁS: Átadjuk az új jelenetnek a szükséges cuccokat (state, ctx, stb.)
        if (this.currentScene && this.currentScene.init) {
            this.currentScene.init(this.state);
        }


    }

    start() {
        console.log("Játék indítása...");
        this.changeScene('menu');
        const loop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update() {
        if (this.currentScene) this.currentScene.update();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.currentScene) this.currentScene.draw(this.ctx);
    }
}