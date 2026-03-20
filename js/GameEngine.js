import { Renderer } from "./core/renderer.js";
import { LangManager } from "./core/langManager.js";
import { InputManager } from "./core/inputManager.js";
import { UiManager } from "./core/uiManager.js";

export class GameEngine {
    constructor() {
        this.datas;
        this.langManager = new LangManager();
        this.renderer = new Renderer(this.langManager);
        this.inputManager = new InputManager();
        this.uiManager = new UiManager(this); 
    }

    async start() {
        await this.langManager.loadLanguage();

        this.uiManager.init(); 

        this.renderer.loadScreen('tpl-main-menu');
    }

    async changeGameLanguage(newLangCode) {
        await this.langManager.changeLanguage(newLangCode);

        this.renderer.updateScreenLanguage();
    }

    loadDatas() {
        // ...
    }
}