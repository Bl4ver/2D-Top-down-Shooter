export class GameEngine {
    constructor() {
        this.uiLayer = document.getElementById('ui-layer');
        this.datas 
    }
    start() {
        this.loadScreen('tpl-main-menu');
    }



    loadScreen(templateId) {
        this.uiLayer.innerHTML = '';

        const template = document.getElementById(templateId);
        const clone = template.content.cloneNode(true);

        if (templateId === 'tpl-main-menu') {
            const startBtn = clone.querySelector('.btn-gameModes');
            startBtn.innerHTML = "asd"
            startBtn.addEventListener('click', () => {
                console.log("Játék indítása!");
            });
        }

        this.uiLayer.appendChild(clone);
    }

    loadDatas() {
        this.datas = 
    }
}