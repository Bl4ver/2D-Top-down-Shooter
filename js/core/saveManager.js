export class SaveManager {
    constructor() {
        this.gameData = null;  // Fix adatok (szörnyek árai, fegyverek alap statjai)
        this.saveState = null; // Játékos mentése (pénz, elért szintek)
        
        this.jsonPath = "assets/datas.json"; 
    }

    async loadDatas() {
        try {
            const response = await fetch(this.jsonPath);
            const json = await response.json();

            this.gameData = json.gameData; 

            const localSave = JSON.parse(localStorage.getItem("neon_saveData"));

            if (localSave) {
                this.saveState = this.mergeDeep(json.state, localSave);
                console.log("Mentés sikeresen betöltve!", this.saveState);
            } else {
                this.saveState = JSON.parse(JSON.stringify(json.state));
                console.log("Új profil létrehozva az alap adatokkal.");
            }

        } catch (error) {
            console.error("Hiba az adatok betöltésekor:", error);
        }
    }

    saveDatas() {
        if (this.saveState) {
            localStorage.setItem("neon_saveData", JSON.stringify(this.saveState));
            console.log("A játékállás elmentve!");
        }
    }

    mergeDeep(defaultObj, savedObj) {
        let result = { ...defaultObj };

        for (const key in savedObj) {
            if (savedObj[key] && typeof savedObj[key] === 'object' && !Array.isArray(savedObj[key])) {
                result[key] = this.mergeDeep(result[key] || {}, savedObj[key]);
            } else {
                result[key] = savedObj[key];
            }
        }
        return result;
    }
}