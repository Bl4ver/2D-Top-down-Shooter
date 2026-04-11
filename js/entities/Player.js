export class Player {
    constructor(engine) {
        this.engine = engine;
        this.gameDirector = engine.gameDirector;
        this.renderer = engine.renderer;
        this.x = 0;
        this.y = 0;
        this.maxHp = 0;
        this.hp = 0;
        this.maxShield = 0;
        this.shield = 0;
        this.speed = 0;
        this.size = 50;
        this.lastShotTime = 0;
        this.isActive = false;
        this.gameData = null;
        this.inventory = null;

        this.activeMelee = null; // Ide mentjük a folyamatosan bekapcsolt fénykardot
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

        this.maxHp = getStatValue('maxHp');
        this.maxShield = getStatValue('maxShield');
        this.speed = getStatValue('speed');
        this.hp = this.maxHp;
        this.shield = this.maxShield;
    }

    getWeaponStat(statKey) {
        const activeWeaponKey = this.inventory.activeWeapon;
        const weaponData = this.gameData.weapons[activeWeaponKey];
        const weaponLevels = this.inventory.weapons[activeWeaponKey].levels;

        if (!weaponData || !weaponLevels[statKey]) return null;
        const statData = weaponData.upgrades[statKey];
        const currentLevel = weaponLevels[statKey];

        return statData.baseValue + ((currentLevel - 1) * statData.inc);
    }

    update(deltaTime) {
        const input = this.engine.inputManager;

        if (input.isKeyDown("KeyA") || input.isKeyDown("ArrowLeft")) this.x -= this.speed * deltaTime;
        if (input.isKeyDown("KeyD") || input.isKeyDown("ArrowRight")) this.x += this.speed * deltaTime;
        if (input.isKeyDown("KeyW") || input.isKeyDown("ArrowUp")) this.y -= this.speed * deltaTime;
        if (input.isKeyDown("KeyS") || input.isKeyDown("ArrowDown")) this.y += this.speed * deltaTime;

        this.x = Math.max(0, Math.min(this.x, this.engine.gameDirector.mapWidth - this.size));
        this.y = Math.max(0, Math.min(this.y, this.engine.gameDirector.mapHeight - this.size));

        // KIKAPCSOLJUK A KARDOT, HA FELENGEDED AZ EGERET!
        if (!input.isMouseDown() && this.activeMelee) {
            this.activeMelee.isActive = false;
            this.activeMelee = null;
        }

        this.renderer.updatePlayerStats(this.hp, this.maxHp, this.shield, this.maxShield);
    }

    shoot(targetX, targetY) {
        if (!this.isActive) return;

        const activeWeaponKey = this.inventory.activeWeapon;
        const weaponData = this.gameData.weapons[activeWeaponKey];
        const damage = this.getWeaponStat('damage');

        if (weaponData.type === "melee") {
            // --- 1. FOLYAMATOS KARD LOGIKA ---
            const range = this.getWeaponStat('range');
            
            if (!this.activeMelee || !this.activeMelee.isActive) {
                this.activeMelee = this.engine.projectilePool.get();
                this.activeMelee.init(this.x, this.y, 0, range, damage, targetX, targetY, "melee");
            }

            // Frissítjük a pozíciót az egér irányába, amíg lenyomva tartod
            const angle = Math.atan2(targetY - (this.y + this.size / 2), targetX - (this.x + this.size / 2));
            this.activeMelee.angle = angle;
            this.activeMelee.damage = damage;
            this.activeMelee.size = range;

            this.activeMelee.x = (this.x + this.size / 2) + Math.cos(angle) * (range / 2) - (range / 2);
            this.activeMelee.y = (this.y + this.size / 2) + Math.sin(angle) * (range / 2) - (range / 2);

        } else {
            // --- 2. GOLYÓ ÉS RAKÉTA LOGIKA ---
            const currentTime = performance.now();
            const fireRate = this.getWeaponStat('fireRate');

            if (currentTime - this.lastShotTime >= fireRate) {
                this.lastShotTime = currentTime;

                const projectile = this.engine.projectilePool.get();
                const speed = this.getWeaponStat('projectileSpeed');
                const turnSpeed = this.getWeaponStat('turnSpeed') || 0;
                const size = 8;

                projectile.init(
                    this.x + this.size / 2, this.y + this.size / 2, 
                    speed, size, damage, targetX, targetY, 
                    weaponData.type, turnSpeed
                );
            }
        }
    }

    takeDamage(amount) {
        if (this.shield > 0) {
            const shieldDamage = Math.min(this.shield, amount);
            this.shield -= shieldDamage;
            amount -= shieldDamage;
            if (amount <= 0) return;
        }
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        }
        this.renderer.updatePlayerStats(this.hp, this.maxHp, this.shield, this.maxShield);
    }

    die() {
        this.isActive = false;
        this.gameDirector.endGame();
    }
}