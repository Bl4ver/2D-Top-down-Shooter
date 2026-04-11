export class EnemyBase {
    constructor(engine, stats) {
        this.engine = engine;
        this.stats = stats;
        this.isActive = false;
        this.maxHp = 0;
        this.hp = 0;
        this.baseSpeed = 0;
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
        this.baseSpeed = this.stats.speed;
        this.damage = this.stats.damage;
        this.color = this.stats.color;
        this.name = this.stats.name;

        this.size = this.stats.width;
        this.activeEffects = [];
    }

    update(player, deltaTime) {
        if (!this.isActive) return;

        // --- 1. EFFEKTEK FELDOLGOZÁSA ---
        let currentSpeed = this.baseSpeed; // Alapból a normál sebességgel megy

        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            let effect = this.activeEffects[i];
            effect.timeLeft -= deltaTime;

            // Fagyás logika: csökkentjük az aktuális sebességet
            if (effect.type === "frozen") {
                currentSpeed *= effect.slowModifier;
            }

            // Méreg logika: folytonos sebzés (DoT - Damage over Time)
            if (effect.type === "toxic") {
                this.hp -= effect.damagePerSec * deltaTime;
                // Szikrázzon néha zölden
                if (Math.random() < 0.05) this.engine.particleManager.createExplosion(this.x, this.y, "#39ff14", 1, 50, 2, 5.0);
            }

            // Ha lejárt az effekt, kivesszük a listából és visszaáll a színe
            if (effect.timeLeft <= 0) {
                this.activeEffects.splice(i, 1);
                this.color = this.stats.color; // Visszakapja az eredeti színét
            }
        }

        if (this.hp <= 0) {
            this.die();
            return;
        }

        // --- 2. MOZGÁS ---
        // Itt már a `currentSpeed`-et használjuk a `this.speed` helyett!
        const dx = (player.x + player.size / 2) - (this.x + this.size / 2);
        const dy = (player.y + player.size / 2) - (this.y + this.size / 2);
        const d = Math.sqrt(dx ** 2 + dy ** 2);

        if (d > 1) {
            this.x += (dx / d) * currentSpeed * deltaTime;
            this.y += (dy / d) * currentSpeed * deltaTime;
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        }
    }

    applyEffect(effectData) {
        // Hozzáadjuk a listához. Ha már van ilyen, azt is lehetne frissíteni, de most egyszerűsítünk:
        this.activeEffects.push({
            type: effectData.type,
            timeLeft: effectData.duration, // Mennyi ideig tart még (mp)
            ...effectData                  // Minden egyéb adat (damagePerSec, slowModifier)
        });

        // Vizuális visszajelzés (pl. fagyásnál kék lesz)
        if (effectData.type === "frozen") this.color = "#00f3ff";
        if (effectData.type === "toxic") this.color = "#39ff14";
    }


    die() {
        const scoreDisplay = document.getElementById('score');

        this.isActive = false;
        this.engine.particleManager.createExplosion(
            this.x + this.size / 2,
            this.y + this.size / 2,
            this.color,
            30, 250, 3, 1.5
        );

        // --- 1. GLOBÁLIS MENTÉS FRISSÍTÉSE (Összesített adatok) ---
        this.engine.saveManager.saveState.statistics.enemiesKilled += 1;
        this.engine.saveManager.saveState.coins += this.stats.earnedCoin;

        // --- 2. AKTUÁLIS KÖR (RUN) ADATAINAK FRISSÍTÉSE ---
        this.engine.gameDirector.score += this.stats.scoreValue;
        this.engine.gameDirector.coinsCollected += this.stats.earnedCoin;

        // Ha még nincs ilyen változó a GameDirectorban, a következő lépésben létrehozzuk!
        if (this.engine.gameDirector.enemiesKilled === undefined) {
            this.engine.gameDirector.enemiesKilled = 0;
        }
        this.engine.gameDirector.enemiesKilled += 1;

        // --- 3. REKORD ÉS UI FRISSÍTÉS ---
        if (this.engine.gameDirector.score > this.engine.saveManager.saveState.highScore) {
            this.engine.saveManager.saveState.highScore = this.engine.gameDirector.score;
        }

        if (scoreDisplay) {
            scoreDisplay.textContent = `${this.engine.gameDirector.score.toString().padStart(6, '0')}`;
        }

        this.engine.saveManager.saveDatas();
    }
}