export class EnemyBase {
    constructor(stats) {
        this.isActive = false;
        this.maxHp = stats.hp;
        this.hp = this.maxHp;
        this.speed = stats.speed;
        this.damage = stats.damage;
        this.color = stats.color;
        this.name = stats.name;
        this.x = 0;
        this.y = 0;
    }

    init(x, y) {
        this.x = x;
        this.y = y;
        this.isActive = true;
    }

    update(player, deltaTime) {
        if (!this.isActive) return;

        const dx = player.x - this.x; // 23 = 50 - 27
        const dy = player.y - this.y; // 12 = 20 - 8
                                        // player = (50, 20), this = (27, 8). VEKTOR => (23, 12)
        const d = Math.sqrt(dx ** 2 + dy ** 2);
                                        // Két pont távolsága = gyökalatt vektor a négyzeten
                                        // 25,9422...

        if (d > 0) {
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

    die() {
        this.isActive = false;
    }

}