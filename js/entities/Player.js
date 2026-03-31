export class Player {
    constructor(engine) {
        this.engine = engine;
        this.gameDirector = engine.gameDirector;
        this.renderer = engine.renderer;
        this.x = 0;
        this.y = 0;
        this.speed = 300;
        this.size = 50;
    }

    init(x = 400, y = 300) {
        // Inicializációs logika, pl. sprite betöltése
        this.x = x;
        this.y = y;
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