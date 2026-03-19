import { Renderer } from "./core/renderer.js";
import { LangManager } from "./core/langManager.js";

export class GameEngine {
    constructor() {
        this.datas;
        this.langManager = new LangManager();
        this.renderer = new Renderer(this.langManager);
    }

    async start() {
        await this.langManager.loadLanguage();

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