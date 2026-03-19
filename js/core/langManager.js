export class LangManager {
    constructor() {
        this.langCode = "en";
        this.content = {};
        this.langJSONPath = "../../assets/language.json";
    }

    init(langCode) {
        this.langCode = langCode;
        this.loadLanguage()
    }

    // Az async kulcsszó lehetővé teszi a várakozást (await)
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

    changeLanguage(langCode) {
        this.langCode = langCode;
        this.loadLanguage();
    }
}