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

                if (this.currentScene === "tpl-upgrades") {
                    this.gameEngine.upgradeManager.loadUpgrades(targetId);
                }
                return;
            }

            // 3. Menü navigációs gombok dinamikus betöltése
            if (e.target.id) {
                const match = e.target.id.match(/^btn-(.*)/);

                if (match) {
                    const screenName = match[1]; // pl: 'mode-normal', 'back', 'settings'

                    switch (screenName) {
                        case 'mode-normal':
                            this.gameEngine.gameDirector.init("normal");
                            this.gameEngine.gameDirector.startGame();
                            this.gameEngine.renderer.setupGameScreen();

                            this.lastScene = this.currentScene;
                            this.currentScene = 'tpl-mode-game';
                            this.gameEngine.renderer.loadScreen(this.currentScene);
                            return;

                        case 'mode-challenge':
                            this.gameEngine.gameDirector.init("challenge");
                            this.gameEngine.gameDirector.startGame();
                            this.gameEngine.renderer.setupGameScreen();

                            this.lastScene = this.currentScene;
                            this.currentScene = 'tpl-mode-game';
                            this.gameEngine.renderer.loadScreen(this.currentScene);
                            return;

                        case "back":
                            if (this.lastScene) {
                                this.gameEngine.renderer.loadScreen(this.lastScene);
                                this.currentScene = this.lastScene;
                                this.lastScene = 'tpl-main-menu';
                            }
                            return;

                        case "upgrades":
                            this.gameEngine.upgradeManager.loadUpgrades('playerUpgrades-container');
                            break;

                        case "pause":
                            this.currentScene = 'tpl-pause-menu';
                            this.gameEngine.renderer.loadScreen(this.currentScene);
                            this.gameEngine.gameDirector.pauseGame();
                            return;
                        case "continue":
                            this.gameEngine.gameDirector.startGame();
                            this.currentScene = 'tpl-mode-game';
                            this.gameEngine.renderer.loadScreen(this.currentScene);
                            return;
                        case "exit":
                            this.gameEngine.gameDirector.endGame();
                            this.currentScene = 'tpl-main-menu';
                            this.gameEngine.renderer.loadScreen(this.currentScene);
                            return;
                    }

                    // Új képernyő (normál menük)
                    this.lastScene = this.currentScene;
                    this.currentScene = `tpl-${screenName}`;
                    // console.log(`Navigáció: ${this.lastScene} -> ${this.currentScene}`);
                    this.gameEngine.renderer.loadScreen(this.currentScene);
                }
            }
        });
    }
}