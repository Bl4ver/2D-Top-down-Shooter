export class Input {
    constructor() {
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        window.addEventListener('onmousedown', (e) => {
            this.keys[e.code] = true;
        });

        window.addEventListener('onmouseup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isKeyDown(keyCode) {
        return this.keys[keyCode] === true;
    }
}