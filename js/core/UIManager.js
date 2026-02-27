export class UIManager {
    constructor() {
        this.screens = document.querySelectorAll('.ui-screen');
    }

    showScreen(screenId) {
        this.screens.forEach(s => s.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    }

    bindButtonEvents(callbacks) {
        document.getElementById('btn-start').onclick = callbacks.onStart;
        document.getElementById('btn-settings').onclick = callbacks.onSettings;
        document.getElementById('btn-statistics').onclick = callbacks.onStatistics;
        document.getElementsByClassName('btn-pause').onclick = callbacks.onPause;
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.onclick = callbacks.onBack;
        });
    }
}