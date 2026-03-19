export class LangManager {
    constructor() {
        this.langCode = "en";
        this.content = {};
        this.langJSONPath = "../../assets/language.json";
    }

    async loadLanguage() {
        try {
            const response = await fetch(this.langJSONPath);
            const json = await response.json();

            this.content = json[0][this.langCode];
            
            console.log("Nyelv betöltve:", this.langCode, this.content);
        } catch (error) {
            console.error("Hiba a nyelv betöltésekor:", error);
        }
    }

    async changeLanguage(langCode) {
        this.langCode = langCode;
        await this.loadLanguage();
    }
}