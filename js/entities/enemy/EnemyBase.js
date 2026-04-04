export class EnemyBase {
    constructor(engine, stats) {
        this.engine = engine;
        this.stats = stats;
        this.isActive = false;
        this.maxHp = 0;
        this.hp = 0;
        this.speed = 0;
        this.damage = 0;
        this.color = '';
        this.name = '';
        this.x = 0;
        this.y = 0;
        this.size = 0;
    }

    init(x, y) {
        this.x = x;
        this.y = y;
        this.isActive = true;

        this.maxHp = this.stats.hp;
        this.hp = this.maxHp;
        this.speed = this.stats.speed;
        this.damage = this.stats.damage;
        this.color = this.stats.color;
        this.name = this.stats.name;

        this.size = this.stats.width;
    }

    update(player, deltaTime) {
        if (!this.isActive) return;

        const dx = (player.x + player.size / 2) - (this.x + this.size / 2); // 23 = 50 - 27
        const dy = (player.y + player.size / 2) - (this.y + this.size / 2); // 12 = 20 - 8
        // player = (50, 20), this = (27, 8). VEKTOR => (23, 12)
        const d = Math.sqrt(dx ** 2 + dy ** 2);
        // Két pont távolsága = gyökalatt vektor a négyzeten
        // 25,9422...

        if (d > 1) {
            this.x += (dx / d) * this.speed * deltaTime;
            this.y += (dy / d) * this.speed * deltaTime;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {     // EZT IS LEHET MAJD MÁSHOVA KELLENE RAKNI (engine-t ide nem is importálni)
        this.isActive = false;
        this.engine.saveManager.saveState.statistics.enemiesKilled += 1;

        this.engine.saveManager.saveState.coins += this.stats.earnedCoin;
        this.engine.gameDirector.score += this.stats.scoreValue;

        if (this.engine.gameDirector.score > this.engine.saveManager.saveState.highScore) {
            this.engine.saveManager.saveState.highScore = this.engine.gameDirector.score;
        }
        this.engine.saveManager.saveDatas();
    }
}