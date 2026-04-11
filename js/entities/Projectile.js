export class Projectile {
    constructor(engine) {
        this.engine = engine;
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.size = 0;
        this.damage = 0;
        this.isActive = false;
    }

    init(x, y, speed, size, damage, targetX, targetY, movementType = "projectile", turnSpeed = 0, effects = []) {
        this.isActive = true;
        this.isEnemyProjectile = false;
        this.damage = damage;
        this.movementType = movementType; // "projectile", "homing", "melee"
        this.turnSpeed = turnSpeed;
        this.effects = effects;

        this.angle = Math.atan2(targetY - y, targetX - x);

        if (this.movementType === "melee") {
            this.x = x;
            this.y = y;
            this.size = size;
            this.hitTargets = new Set(); 
            this.color = "#bc13fe";
        } 
        else if (this.movementType === "homing") {
            this.x = x;
            this.y = y;
            this.size = size;
            this.speed = speed;
            this.currentAngle = this.angle;
            this.vx = Math.cos(this.currentAngle) * this.speed;
            this.vy = Math.sin(this.currentAngle) * this.speed;
            this.color = "#ff9900";
        } 
        else {
            this.x = x;
            this.y = y;
            this.size = size;
            this.vx = Math.cos(this.angle) * speed;
            this.vy = Math.sin(this.angle) * speed;
            this.color = "#00f3ff";
        }
    }

    update(deltaTime) {
        if (!this.isActive) return;

        if (this.movementType === "melee") {
            // A Player frissíti a pozícióját, amíg nyomod az egeret!
        } 
        else if (this.movementType === "homing") {
            const mouseX = this.engine.inputManager.mouse.x + (this.engine.renderer.camX || 0);
            const mouseY = this.engine.inputManager.mouse.y + (this.engine.renderer.camY || 0);

            const desiredAngle = Math.atan2(mouseY - this.y, mouseX - this.x);

            let angleDiff = desiredAngle - this.currentAngle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

            const turnAmount = this.turnSpeed * deltaTime;
            if (Math.abs(angleDiff) < turnAmount) {
                this.currentAngle = desiredAngle; 
            } else {
                this.currentAngle += Math.sign(angleDiff) * turnAmount; 
            }

            this.vx = Math.cos(this.currentAngle) * this.speed;
            this.vy = Math.sin(this.currentAngle) * this.speed;

            // Kondenzcsík (szikrák), limitálva a spamelést
            if (this.engine.particleManager && Math.random() < 0.4) {
                this.engine.particleManager.createExplosion(
                    this.x + this.size / 2, this.y + this.size / 2, 
                    "#ff0044", 1, 30, 2, 5.0 
                );
            }

            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
        } 
        else {
            this.x += this.vx * deltaTime;
            this.y += this.vy * deltaTime;
        }
    }
}