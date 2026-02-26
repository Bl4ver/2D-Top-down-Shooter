export class Bullet {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.active = false; // Alapból inaktív
    }

    spawn(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        // Itt kiszámolod az irányt (vektorokat)...
        this.active = true;
    }

    update() {
        if (!this.active) return;
        
        this.x += this.speedX;
        this.y += this.speedY;

        // Ha kimegy a képből, inaktívvá tesszük, hogy újra felhasználható legyen
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.active = false;
        }
    }
}

// LÖVÉSKOR:
function shoot(startX, startY) {
    const b = bulletPool.get(); // Ez vagy ad egy régit, vagy csinál egy újat
    b.spawn(startX, startY, mouse.x, mouse.y);
}