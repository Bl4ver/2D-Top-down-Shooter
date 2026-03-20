export class Renderer {
    constructor(langManager) {
        this.uiLayer = document.getElementById('ui-layer');
        this.langManager = langManager;
    }

    translateNode(node) {
        const elements = node.querySelectorAll('[data-lang]');

        elements.forEach(element => {
            const key = element.getAttribute('data-lang');
            if (this.langManager.content[key]) {
                element.textContent = this.langManager.content[key];
            }
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