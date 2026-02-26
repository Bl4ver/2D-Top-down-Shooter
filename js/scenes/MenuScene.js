// import { Scene } from './Scene.js'; // Ha csináltál alaposztályt

export class MenuScene {
    constructor(engine) {
        this.engine = engine;
    }

    init(state) {
        // 1. Megjelenítjük a HTML-t
        this.engine.uiManager.showScreen('main-menu');

        // 2. Bekötjük a gombokat
        this.engine.uiManager.bindButtonEvents({
            onStart: () => this.engine.changeScene('game'),
            onSettings: () => this.engine.changeScene('settings'),
            onStatistics: () => this.engine.changeScene('statistics')
        });
    }

    update() {}
    draw(ctx) {
        // Itt rajzolhatsz pl. egy animált hátteret a menü alá a canvasra!
    }
    exit() {}
}