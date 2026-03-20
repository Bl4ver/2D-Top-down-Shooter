export class UiManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.currentScene = 'tpl-main-menu';
        this.lastScene = null;
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {

            if (e.target.classList.contains('lang-btn')) {
                const lang = e.target.getAttribute('data-lang');
                this.gameEngine.changeGameLanguage(lang);
                return;
            }

            if (e.target.id) {
                const match = e.target.id.match(/^btn-(.*)/);

                if (match) {
                    const screenName = match[1];

                    if (screenName === "back") {
                        if (this.lastScene) {
                            this.gameEngine.renderer.loadScreen(this.lastScene);

                            this.currentScene = this.lastScene;
                            this.lastScene = 'tpl-main-menu';
                        }
                        return;
                    }
                    this.lastScene = this.currentScene;
                    this.currentScene = `tpl-${screenName}`;
                    this.gameEngine.renderer.loadScreen(this.currentScene);
                    return;
                }
            }
        });
    }
}