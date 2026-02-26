export class State {
    constructor() {
        // Alap statisztikák
        this.maxScore = 0;
        this.moneyEarned = 0; // Összesen gyűjtött pénz (statisztika)
        this.credits = 0;     // Jelenleg elkölthető pénz
        this.kills = 0;
        this.timePlayed = 0;  // Másodpercben
        this.maxLevelReached = 1;

        // Beállítások (így a hangerő is megmarad két játék között)
        this.settings = {
            volume: 70,
            language: 'hu'
        };

        // Inventory / Unlockok
        this.unlockedBots = [];
        this.unlockedItems = []; 
        this.unlockedUpgrades = [];
        this.upgrades = [];
        
        // Automatikus betöltés indításkor
        this.load();
    }

    // --- MÓDOSÍTÓK (Helper methods) ---

    addCredits(amount) {
        this.credits += amount;
        this.moneyEarned += amount;
        this.save(); // Minden pénzmozgásnál mentsünk
    }

    updateHighScore(score) {
        if (score > this.maxScore) {
            this.maxScore = score;
            this.save();
            return true; // Jelezzük, ha új rekord született
        }
        return false;
    }

    addKill() {
        this.kills++;
        // Nem kell minden killnél menteni (teljesítmény miatt), 
        // elég a kör végén, de itt is lehet.
    }

    // --- MENTÉS ÉS BETÖLTÉS (LocalStorage) ---

    save() {
        const data = {
            maxScore: this.maxScore,
            moneyEarned: this.moneyEarned,
            credits: this.credits,
            kills: this.kills,
            timePlayed: this.timePlayed,
            maxLevelReached: this.maxLevelReached,
            settings: this.settings,
            unlockedItems: this.unlockedItems
        };
        localStorage.setItem('neon_overdrive_save', JSON.stringify(data));
        console.log("Protocol: Data synced to local storage.");
    }

    load() {
        const savedData = localStorage.getItem('neon_overdrive_save');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            // Felülírjuk az alapértékeket a mentettel
            Object.assign(this, parsed);
        }
    }

    reset() {
        if(confirm("Biztosan törlöd a Cybercore mentést?")) {
            localStorage.removeItem('neon_overdrive_save');
            // location.reload(); // Újratöltjük a játékot az alapértékekkel
        }
    }
}