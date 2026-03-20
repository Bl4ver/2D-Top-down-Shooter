export class LangManager {
    constructor() {
        this.langCode = localStorage.getItem("langCode") || "en";
        this.content = {};
        this.langJSONPath = "assets/language.json";
    }

    async loadLanguage() {
        try {
            const response = await fetch(this.langJSONPath);
            const json = await response.json();

            this.content = json[this.langCode];

            console.log("Nyelv betöltve:", this.langCode);
        } catch (error) {
            console.error("Hiba a nyelv betöltésekor:", error);
        }
    }

    async changeLanguage(langCode) {
        this.langCode = langCode;

        localStorage.setItem("langCode", langCode);

        await this.loadLanguage();
    }
}