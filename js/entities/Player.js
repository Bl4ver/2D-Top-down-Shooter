export class Player {
    constructor(engine) {
        this.engine = engine;
        this.gameDirector = engine.gameDirector;
        this.renderer = engine.renderer;
        this.x = 0;
        this.y = 0;
        this.maxHp = 0;
        this.hp = 0;
        this.speed = 0;
        this.size = 50;
        this.lastShotTime = 0;
        this.isActive = false;
        this.gameData = null;
        this.inventory = null;
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
        this.maxHp = getStatValue('maxHp');
        this.speed = getStatValue('speed');

        this.hp = this.maxHp;
    }

    getWeaponStat(statKey) {
        const activeWeaponKey = this.inventory.activeWeapon;
        const weaponData = this.gameData.weapons[activeWeaponKey];
        const weaponLevels = this.inventory.weapons[activeWeaponKey].levels;

        if (!weaponData || !weaponLevels[statKey]) return null;

        const statData = weaponData.upgrades[statKey];
        const currentLevel = weaponLevels[statKey];

        // Érték = Alapérték + ((Szint - 1) * Növekmény)
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
    }

    shoot(targetX, targetY) {
        if (!this.isActive) return;

        const currentTime = performance.now();
        const fireRate = this.getWeaponStat('fireRate');

        if (currentTime - this.lastShotTime >= fireRate) {
            this.lastShotTime = currentTime;

            const projectile = this.engine.projectilePool.get();
            
            // Lekérjük a fegyver sebzését és a golyó sebességét
            const speed = this.getWeaponStat('projectileSpeed');
            const damage = this.getWeaponStat('damage');
            const size = 5; // Golyó alapmérete

            // Most már pontosan egyezik a Projectile.js init-jével!
            projectile.init(this.x + this.size / 2, this.y + this.size / 2, speed, size, damage, targetX, targetY);
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
        console.log("A játékos meghalt!");
    }
}