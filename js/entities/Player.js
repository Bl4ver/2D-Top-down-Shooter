export class Player {
    constructor() {
        this.x = 5;
        this.y = 5;
        this.speed = 10;
    }

    init() {

    }

    spawn() {

    }

    update(input) {
        if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) {
            this.y -= this.speed; // Mozgás felfelé
        }
        if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown')) {
            this.y += this.speed; // Mozgás lefelé
        }
        // stb.
    }

    move() {

    }
}

