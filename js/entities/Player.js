export class Player {
    constructor(engine) {
        this.engine = engine;
        this.gameDirector = engine.gameDirector;
        this.renderer = engine.renderer;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.size = 50;

    }

    init(x = 400, y = 300) {

        this.x = x;
        this.y = y;
        this.isActive = true;

        this.gameData = this.engine.saveManager.gameData;
        this.inventory = this.engine.saveManager.saveState.inventory;

        const getStatValue = (statKey) => {
            const statData = this.gameData.playerUpgrades[statKey];
            const currentLevel = this.inventory.playerUpgrades[statKey];

            if (!statData || !currentLevel) return null;
            return statData.baseValue + ((currentLevel - 1) * statData.inc);
        };

        // --- STATISZTIKÁK BEÁLLÍTÁSA ---
        this.maxHp = getStatValue('hp');
        this.speed = getStatValue('speed');

        this.hp = this.maxHp;
    }

    update(deltaTime) {
        const input = this.engine.inputManager;

        if (input.isKeyDown("KeyA") || input.isKeyDown("ArrowLeft")) this.x -= this.speed * deltaTime;
        if (input.isKeyDown("KeyD") || input.isKeyDown("ArrowRight")) this.x += this.speed * deltaTime;
        if (input.isKeyDown("KeyW") || input.isKeyDown("ArrowUp")) this.y -= this.speed * deltaTime;
        if (input.isKeyDown("KeyS") || input.isKeyDown("ArrowDown")) this.y += this.speed * deltaTime;

        this.x = Math.max(0, Math.min(this.x, this.engine.gameDirector.mapWidth - this.size));
        this.y = Math.max(0, Math.min(this.y, this.engine.gameDirector.mapHeight - this.size));
    }
}