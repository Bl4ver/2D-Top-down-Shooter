import { EnemyBase } from './EnemyBase.js';

export class RangeEnemy extends EnemyBase {
    constructor(engine, stats) {
        super(engine, stats); 
        this.lastShotTime = 0;
        
        // Később fireRate a JSON-be.
        this.fireRate = stats.fireRate || 2000; 
    }

    update(player, deltaTime) {
        super.update(player, deltaTime);

        if (!player || !player.isActive) return;

        const currentTime = performance.now();
        if (currentTime - this.lastShotTime >= this.fireRate) {
            this.lastShotTime = currentTime;
            
            const targetX = player.x + player.size / 2;
            const targetY = player.y + player.size / 2;
            
            this.shoot(targetX, targetY);
        }
    }

    shoot(targetX, targetY) {
        if (!this.isActive) return;

        const projectile = this.engine.projectilePool.get();

        const speed = 300;
        const size = 6;
        const damage = this.stats.damage;

        projectile.init(this.x + this.size / 2, this.y + this.size / 2, speed, size, damage, targetX, targetY);

        projectile.isEnemyProjectile = true; 
    }
}