export class Renderer {
    constructor(engine) {
        this.engine = engine;
        this.uiLayer = document.getElementById('ui-layer');
        this.langManager = this.engine.langManager;
        this.gameCanvas = document.getElementById('gameCanvas');    // EZEK SZEREPELNEK A GAMEDIRECTORBAN IS!!!
        this.ctx = this.gameCanvas.getContext('2d');
        this.camX = 0;
        this.camY = 0;
    }

    translateNode(node) {
        const elements = node.querySelectorAll('[data-lang]');

        elements.forEach(element => {
            const key = element.getAttribute('data-lang');
            if (this.langManager.content[key]) {
                element.textContent = this.langManager.content[key];
            }
        });
    }

    loadScreen(templateId) {
        this.uiLayer.innerHTML = '';
        const template = document.getElementById(templateId);

        if (!template) {
            console.error(`A template nem található: ${templateId}`);
            return;
        }

        const clone = template.content.cloneNode(true);
        this.translateNode(clone);
        this.uiLayer.appendChild(clone);
    }

    setupGameScreen() {
        this.uiLayer.innerHTML = ''; // Menü eltüntetése
        document.documentElement.style.setProperty('background-image', 'none', 'important');
        document.documentElement.style.setProperty('background-color', '#000000', 'important');
        document.body.style.setProperty('background-image', 'none', 'important');
        document.body.style.setProperty('background-color', '#000000', 'important');

        this.gameCanvas.width = window.innerWidth;
        this.gameCanvas.height = window.innerHeight;

        this.gameCanvas.style.width = '100vw';
        this.gameCanvas.style.height = '100vh';
        this.gameCanvas.style.display = 'block';

        this.centerCameraOnPlayer();
    }

    centerCameraOnPlayer() {
        const player = this.engine.player;
        if (!player) return;

        // Kiszámítjuk, hol kell lennie a kamerának, hogy a játékos pontosan középen legyen
        let targetCamX = (player.x + player.size / 2) - (this.gameCanvas.width / 2);
        let targetCamY = (player.y + player.size / 2) - (this.gameCanvas.height / 2);

        const mapW = this.engine.gameDirector.mapWidth;
        const mapH = this.engine.gameDirector.mapHeight;

        // Biztosítjuk, hogy itt se lógjunk ki a fekete semmibe
        this.camX = Math.max(0, Math.min(targetCamX, mapW - this.gameCanvas.width));
        this.camY = Math.max(0, Math.min(targetCamY, mapH - this.gameCanvas.height));
    }

    renderEntities() {
        this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

        const player = this.engine.player;
        if (!player) return;

        this.ctx.save();

        // --- LETISZTULT KAMERA (Smooth Follow) ---
        if (this.engine.gameDirector.cameraFollowPlayer) {
            // 1. Kiszámoljuk a "Célpontot" (ahol a kamerának lennie kellene, hogy középen legyél)
            let targetX = (player.x + 25) - (this.gameCanvas.width / 2);
            let targetY = (player.y + 25) - (this.gameCanvas.height / 2);

            // 2. Korlátozzuk a célpontot a pálya széléhez (Clamp)
            const mapW = this.engine.gameDirector.mapWidth;
            const mapH = this.engine.gameDirector.mapHeight;
            targetX = Math.max(0, Math.min(targetX, mapW - this.gameCanvas.width));
            targetY = Math.max(0, Math.min(targetY, mapH - this.gameCanvas.height));

            // 3. A VARÁZSLAT (Lerp): A kamera jelenlegi pozíciójához hozzáadjuk a távolság 10%-át.
            // Ettől a kamera selymesen lágyan, egy kis csúszással fog követni!
            this.camX += (targetX - this.camX) * 0.1;
            this.camY += (targetY - this.camY) * 0.1;

            this.ctx.translate(-this.camX, -this.camY);
        } else {
            // Challenge módban nincs kamera mozgás
            this.camX = 0;
            this.camY = 0;
        }
        // -----------------------------------------

        const mapW = this.engine.gameDirector.mapWidth;
        const mapH = this.engine.gameDirector.mapHeight;

        // 1. Pálya külső kerete
        this.ctx.strokeStyle = '#ff0044';
        this.ctx.lineWidth = 10;
        this.ctx.strokeRect(0, 0, mapW, mapH);

        // 2. Padlórács
        this.ctx.strokeStyle = '#111111';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        for (let x = 0; x <= mapW; x += 200) { this.ctx.moveTo(x, 0); this.ctx.lineTo(x, mapH); }
        for (let y = 0; y <= mapH; y += 200) { this.ctx.moveTo(0, y); this.ctx.lineTo(mapW, y); }
        this.ctx.stroke();

        // 3. Játékos kirajzolása
        this.ctx.fillStyle = '#00ffcc';
        this.ctx.fillRect(player.x, player.y, 50, 50);

        this.ctx.restore();
    }

    updateScreenLanguage() {
        this.translateNode(this.uiLayer);
    }
}