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

            // 1. Nyelvválasztó gombok
            if (e.target.classList.contains('btn-change-lang')) {
                const lang = e.target.getAttribute('data-change-lang');
                if (lang !== this.gameEngine.langManager.langCode) {
                    this.gameEngine.changeGameLanguage(lang);
                }
                return;
            }

            // 2. FÜL VÁLTÁS LOGIKA 
            if (e.target.classList.contains('tab-btn')) {
                const screen = e.target.closest('.ui-screen');

                screen.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                screen.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

                e.target.classList.add('active');

                const targetId = e.target.getAttribute('data-target');
                const targetContainer = screen.querySelector(`#${targetId}`);
                if (targetContainer) {
                    targetContainer.classList.add('active');
                }
                return;
            }

            // 3. Menü navigációs gombok dinamikus betöltése
            if (e.target.id) {
                const match = e.target.id.match(/^btn-(.*)/);

                if (match) {
                    const screenName = match[1];

                    // Vissza gomb
                    if (screenName === "back") {
                        if (this.lastScene) {
                            this.gameEngine.renderer.loadScreen(this.lastScene);
                            this.currentScene = this.lastScene;
                            this.lastScene = 'tpl-main-menu';
                        }
                        return;
                    }

                    // Új képernyő
                    this.lastScene = this.currentScene;
                    this.currentScene = `tpl-${screenName}`;
                    this.gameEngine.renderer.loadScreen(this.currentScene);
                    return;
                }
            }
        });
    }
}