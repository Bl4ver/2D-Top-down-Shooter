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

        if (this.engine.gameDirector.cameraFollowPlayer) {
            // 1. Kiszámoljuk a "Célpontot" (ahol a kamerának lennie kellene, hogy középen legyél)
            let targetX = (player.x + player.size / 2) - (this.gameCanvas.width / 2);
            let targetY = (player.y + player.size / 2) - (this.gameCanvas.height / 2);

            // 2. Korlátozzuk a célpontot a pálya széléhez (Clamp)
            const mapW = this.engine.gameDirector.mapWidth;
            const mapH = this.engine.gameDirector.mapHeight;
            targetX = Math.max(0, Math.min(targetX, mapW - this.gameCanvas.width));
            targetY = Math.max(0, Math.min(targetY, mapH - this.gameCanvas.height));

            this.camX += (targetX - this.camX) * 0.1;
            this.camY += (targetY - this.camY) * 0.1;

            this.ctx.translate(-this.camX, -this.camY);
        } else {
            // Challenge módban nincs kamera mozgás
            this.camX = 0;
            this.camY = 0;
        }

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
        this.ctx.fillRect(player.x, player.y, player.size, player.size);

        this.ctx.restore();

        // 4. Ellenségek kirajzolása
        Object.values(this.engine.enemyPools).forEach(pool => {
            pool.pool.forEach(enemy => {
                if (enemy.isActive) {
                    this.ctx.save();

                    // Neon effekt beállítása
                    this.ctx.strokeStyle = enemy.color;
                    this.ctx.shadowColor = enemy.color;
                    this.ctx.shadowBlur = 15;
                    this.ctx.lineWidth = 2;

                    const eSize = enemy.size || 40; // ?

                    // Ellenség kirajzolása
                    this.ctx.strokeRect(enemy.x, enemy.y, eSize, eSize);

                    this.ctx.restore();
                }
            });
        });

        this.ctx.restore();
    }

    renderMinimap() {
        const minimapSize = 200;
        const padding = 20;
        
        // 1. MÉRETARÁNY (Scale) kiszámítása
        const scaleX = minimapSize / this.engine.gameDirector.mapWidth;  // pl: 0.02
        const scaleY = minimapSize / this.engine.gameDirector.mapHeight; // pl: 0.02

        // 2. MINIMAP POZÍCIÓJA a képernyőn (jobb alsó sarok)
        const miniMapPosX = this.gameCanvas.width - minimapSize - padding;
        const miniMapPosY = this.gameCanvas.height - minimapSize - padding;

        // 3. MINIMAP HÁTTÉR ÉS KERET RAJZOLÁSA
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(miniMapPosX, miniMapPosY, minimapSize, minimapSize);
        this.ctx.strokeStyle = '#00d9ff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(miniMapPosX, miniMapPosY, minimapSize, minimapSize);
        this.ctx.restore();

        // 4. JÁTÉKOS PONT KISZÁMÍTÁSA A RADARON
        const player = this.engine.player;
        
        // Játékos közepe a VILÁGBAN * Méretarány
        const playerDotX = (player.x + player.size / 2) * scaleX;
        const playerDotY = (player.y + player.size / 2) * scaleY;

        // Végleges képernyő-koordináta = Minimap sarka + Pont helye a radaron
        const playerMiniX = miniMapPosX + playerDotX;
        const playerMiniY = miniMapPosY + playerDotY;

        // 5. JÁTÉKOS RAJZOLÁSA
        this.ctx.save();
        this.ctx.fillStyle = '#00d9ff';
        this.ctx.fillRect(playerMiniX - 5, playerMiniY - 5, 10, 10); 
        this.ctx.restore();

        // 6. ELLENSÉGEK RAJZOLÁSA
        Object.values(this.engine.enemyPools).forEach(pool => {
            pool.pool.forEach(enemy => {
                if (enemy.isActive) {
                    const enemyDotX = (enemy.x + enemy.size / 2) * scaleX;
                    const enemyDotY = (enemy.y + enemy.size / 2) * scaleY;

                    const enemyMiniX = miniMapPosX + enemyDotX;
                    const enemyMiniY = miniMapPosY + enemyDotY;

                    this.ctx.save();
                    this.ctx.fillStyle = enemy.color;
                    this.ctx.fillRect(enemyMiniX - 3, enemyMiniY - 3, 6, 6); 
                    this.ctx.restore();
                }
            });
        });
    }

    updateScreenLanguage() {
        this.translateNode(this.uiLayer);
    }
}