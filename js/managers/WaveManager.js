export class WaveManager {
    constructor(engine) {
        this.engine = engine;
        this.gameDirector = engine.gameDirector;
        
        this.currentWave = 1;
        this.spawnTimer = 0;
        
        // Kiegyensúlyozott kezdés: picit lassabb indulás
        this.baseSpawnInterval = 2500; 
        this.spawnInterval = this.baseSpawnInterval;

        this.waveTimer = 0;
        this.waveDuration = 5000; // 30 másodperc egy hullám
        
        // Káosz-kontroll: Maximálisan ennyi ellenség lehet egyszerre a pályán
        this.maxActiveEnemies = 15; 
    }

    init() {
        this.currentWave = 1;
        this.spawnTimer = 0;
        this.waveTimer = 0;
        this.spawnInterval = this.baseSpawnInterval;
        this.maxActiveEnemies = 15;
    }

    update(deltaTime) {
        const dtMs = deltaTime * 1000;
        
        this.spawnTimer += dtMs; 
        this.waveTimer += dtMs;

        // 1. HULLÁM LÉPTETÉSE
        if (this.waveTimer >= this.waveDuration) {
            const levelDisplay = document.getElementById('level-label');
            if (levelDisplay) {
                levelDisplay.textContent = `Level: ${this.currentWave.toString().padStart(2, '0')}`;
            }
            else console.log(this.currentWave, levelDisplay);

            this.waveTimer = 0;
            this.currentWave++;
            
            // Finomabb nehezedés: Minden hullámmal 15%-kal gyorsabban jönnek (exponenciális csökkenés)
            // Sosem megy 150ms alá, hogy ne fagyjon ki a játék
            this.spawnInterval = Math.max(150, this.spawnInterval * 0.85);
            
            // Káosz engedélyezése: Hullámonként egyre több ellenség lehet egyszerre a képernyőn
            this.maxActiveEnemies += 10; 
        }

        // 2. ELLENSÉG SPAWNOLÁSA
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            
            // Csak akkor spawnol, ha a limit megengedi (nem halmozódnak fel a végtelenségig, ha nincs dps)
            if (this.getActiveEnemyCount() < this.maxActiveEnemies) {
                this.spawnRandomEnemyForCurrentWave();
            }
        }
    }

    // Segédfüggvény: Összeszámolja az éppen aktív ellenségeket
    getActiveEnemyCount() {
        let count = 0;
        Object.values(this.engine.enemyPools).forEach(pool => {
            count += pool.pool.filter(e => e.isActive).length;
        });
        return count;
    }

    spawnRandomEnemyForCurrentWave() {
        const enemyDatas = this.engine.saveManager.gameData.enemies;
        const availablePools = [];

        for (const [enemyId, stats] of Object.entries(enemyDatas)) {
            if (stats.level <= this.currentWave) {
                const weight = Math.max(1, 5 - (stats.level || 1)); 
                for(let i = 0; i < weight; i++) {
                    availablePools.push(`${enemyId}Pool`);
                }
            }
        }

        if (availablePools.length > 0) {
            const randomPool = availablePools[Math.floor(Math.random() * availablePools.length)];
            this.engine.gameDirector.spawnEnemy(randomPool);
        }
    }
}