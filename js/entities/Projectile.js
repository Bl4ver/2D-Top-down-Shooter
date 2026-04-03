export class Projectile {
    constructor(engine) {
        this.engine = engine;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.size = 0;
        this.damage = 0;
        this.isActive = false;

        this.vector = {
            dx: 0,
            dy: 0
        };
    }

    init(x, y, speed, size, damage, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.size = size;
        this.damage = damage;
        this.isActive = true;

        // 1. Kiszámoljuk a különbséget
        let dx = targetX - this.x;
        let dy = targetY - this.y;
        
        // 2. Vektor hossza (Pitagorasz-tétel)
        const length = Math.sqrt(dx * dx + dy * dy);

        // 3. Normalizálás (Egységvektor képzése) ITT EGYSZER
        if (length > 0) {
            this.vector.dx = dx / length;
            this.vector.dy = dy / length;
        } else {
            this.vector.dx = 0;
            this.vector.dy = 0;
        }
    }

    update(deltaTime) {
        this.x += this.vector.dx * this.speed * deltaTime;
        this.y += this.vector.dy * this.speed * deltaTime;
    }
}