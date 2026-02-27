import { Bullet } from "./Bullet.js"

export class Player {
    constructor(engine) {
        this.engine = engine;
        // Kezdőpozíció a képernyő közepén
        this.x = (this.engine.canvas.width / 2);
        this.y = (this.engine.canvas.height / 2);
        console.log(this.x, this.y)
        this.speed = 1.2;
        this.hp = 100;
        this.shield = 50;
        this.active = true;

        this.shootCooldown = 200; // 200ms a lövések között
        this.lastShotTime = 0;

        this.mouse = { x: 0, y: 0 };
        window.addEventListener('mousemove', (event) => {
            const rect = this.engine.ctx.canvas.getBoundingClientRect();
            this.mouse.x = event.clientX - rect.left;
            this.mouse.y = event.clientY - rect.top;
        });
    }

    init() {
        // Itt inicializálhatsz hangokat, textúrákat, stb.
    }

    update(input) {
        if (!input) return;

        // Ütközésvizsgálat a jobb és alsó széleken a vászon belső méretével
        const canvasW = this.engine.canvas.width;
        const canvasH = this.engine.canvas.height;

        if (input.isKeyDown('KeyW') || input.isKeyDown('ArrowUp')) {
            this.y = Math.max(0, this.y - this.speed);
        }
        if (input.isKeyDown('KeyS') || input.isKeyDown('ArrowDown')) {
            // A 20-as levonás azért kell, mert a fillRect a bal felső sarkától rajzol
            this.y = Math.min(canvasH - 20, this.y + this.speed);
        }
        if (input.isKeyDown('KeyA') || input.isKeyDown('ArrowLeft')) {
            this.x = Math.max(0, this.x - this.speed);
        }
        if (input.isKeyDown('KeyD') || input.isKeyDown('ArrowRight')) {
            this.x = Math.min(canvasW - 20, this.x + this.speed);
        }

        if (input.isKeyDown('KeyD')) { // 'Mouse0' a bal klikk
            const now = Date.now();
            if (now - this.lastShotTime > this.shootCooldown) {
                this.shoot();
                this.lastShotTime = now;
            }
            console.log("Shoot")
        }
    }

    shoot() {
        const dx = this.mouse.x - this.x;
        const dy = this.mouse.y - this.y;

        let bullet = new Bullet()
        bullet.spawn(this.x, this.y, dx, dy);
        console.log("Shoot");
    }

    draw() {
        const ctx = this.engine.ctx;

        // 1. Különbség kiszámítása
        const dx = this.mouse.x - this.x;
        const dy = this.mouse.y - this.y;

        // 2. Szög kiszámítása radiánban
        const angle = Math.atan2(dy, dx);

        ctx.save(); // Állapot mentése

        // 3. A rajzolás középpontját a játékoshoz toljuk
        ctx.translate(this.x, this.y);

        /*
        if (this.shield > 0) {
            ctx.beginPath(); ctx.arc(0, 0, this.radius + 12, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 243, 255, ${0.2 + Math.sin(frameCount * 0.1) * 0.1})`;
            ctx.lineWidth = 2; ctx.stroke();
        }
        */

        // 4. Elforgatjuk a "papírt" az egér felé
        ctx.rotate(angle);

        // 5. Kirajzoljuk a háromszöget
        ctx.fillStyle = "#00f3ff";
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f3ff'
        ctx.beginPath();

        // Az orra (jobbra néz alapból, mert a 0 radián a pozitív X tengely)
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(-12, -14);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-12, 14);
        ctx.closePath();
        ctx.fill();

        ctx.restore(); // Állapot visszaállítása
    }
}