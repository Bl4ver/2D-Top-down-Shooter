export class WaveManager {
    constructor(engine) {
        this.engine = engine;
        this.gameDirector = engine.gameDirector;
        
        this.currentWave = 1;
        this.spawnTimer = 0;
        this.spawnInterval = 2000; // Kezdetben 2 másodpercenként jönnek

        // Hullám léptetéshez szükséges változók
        this.waveTimer = 0;
        this.waveDuration = 30000; // 30 másodpercig tart egy hullám (ms-ben)
    }

    init() {
        this.currentWave = 1;
        this.spawnTimer = 0;
        this.waveTimer = 0;
        this.spawnInterval = 2000; // Alaphelyzetbe állítjuk a nehézséget
        console.log(`--- HULLÁM ${this.currentWave} INDUL ---`);
    }

    update(deltaTime) {
        const dtMs = deltaTime * 1000; // ms-be váltjuk
        
        this.spawnTimer += dtMs; 
        this.waveTimer += dtMs;

        // 1. HULLÁM LÉPTETÉSE (Ha letelt a 30 másodperc)
        if (this.waveTimer >= this.waveDuration) {
            this.waveTimer = 0;
            this.currentWave++;
            
            // Nehezítés: minden hullámnál 200 ms-el gyorsabban jönnek az ellenségek
            // (A Math.max biztosítja, hogy 500 ms-nél ne legyenek gyorsabbak, különben lefagy a gép)
            this.spawnInterval = Math.max(500, this.spawnInterval - 200);
            
            console.log(`--- HULLÁM ${this.currentWave} INDUL --- (Spawn: ${this.spawnInterval}ms)`);
        }

        // 2. ELLENSÉG SPAWNOLÁSA
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnRandomEnemyForCurrentWave();
        }
    }

    spawnRandomEnemyForCurrentWave() {
        const enemyDatas = this.engine.saveManager.gameData.enemies;
        const availablePools = [];

        for (const [enemyId, stats] of Object.entries(enemyDatas)) {
            if (stats.level <= this.currentWave) {
                availablePools.push(`${enemyId}Pool`);
            }
        }

        if (availablePools.length > 0) {
            const randomPool = availablePools[Math.floor(Math.random() * availablePools.length)];
            
            this.engine.gameDirector.spawnEnemy(randomPool);
        }
    }
}