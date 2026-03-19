export class Renderer {
    constructor(langManager) {
        this.uiLayer = document.getElementById('ui-layer');
        this.langManager = langManager;
    }

    translateNode(node) {
        Object.entries(this.langManager.content).forEach(([key, text]) => {
            const elements = node.querySelectorAll(`.${key}`);
            
            elements.forEach(element => {
                element.textContent = text;
            });
        });
    }

    loadScreen(templateId) {
        this.uiLayer.innerHTML = '';

        const template = document.getElementById(templateId);
        if (!template) {
            console.error(`A template nem található: ${templateId}`);
            return;
        }

        const clone = template.content.cloneNode(true);

        this.translateNode(clone);

        this.uiLayer.appendChild(clone);
    }

    updateScreenLanguage() {
        this.translateNode(this.uiLayer);
    }
}