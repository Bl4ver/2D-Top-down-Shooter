import { Renderer } from "./core/renderer.js";
import { LangManager } from "./core/langManager.js";
import { InputManager } from "./core/inputManager.js";
import { UiManager } from "./core/uiManager.js";
import { SaveManager } from "./core/saveManager.js";

export class GameEngine {
    constructor() {
        this.langManager = new LangManager();
        this.renderer = new Renderer(this.langManager);
        this.inputManager = new InputManager();
        this.uiManager = new UiManager(this);
        this.saveManager = new SaveManager();

    }

    async start() {
        await this.langManager.loadLanguage();

        this.uiManager.init();

        await this.saveManager.loadDatas();

        this.renderer.loadScreen('tpl-main-menu');
    }

    async changeGameLanguage(newLangCode) {
        await this.langManager.changeLanguage(newLangCode);

        this.renderer.updateScreenLanguage();
    }
}

/*
    // És ha később le akarod vonni a pénzt egy fejlesztésnél:
    this.saveManager.saveState.coins -= 50;
    this.saveManager.saveDatas(); // Mentés a LocalStorage-ba
*/