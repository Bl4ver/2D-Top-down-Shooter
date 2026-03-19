import { LangManager } from "./core/langManager.js"
export class GameEngine {
    constructor() {
        this.uiLayer = document.getElementById('ui-layer');
        this.datas;
        this.langManager = new LangManager
    }
    start() {
        this.loadScreen('tpl-main-menu');
        this.langManager.init("hu")
    }



    loadScreen(templateId) {
        this.uiLayer.innerHTML = '';

        const template = document.getElementById(templateId);
        const clone = template.content.cloneNode(true);

        console.log(clone)

        this.uiLayer.appendChild(clone);
    }

    loadDatas() {
        this.datas = "asd"
    }
}