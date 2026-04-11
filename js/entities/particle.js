export class Particle {
    // Az ObjectPool mindig átadja az engine-t és a configot/statokat
    constructor(engine, stats) {
        this.engine = engine; 
        this.isActive = false;
    }

    init(x, y, color, speed, size, lifeDecay) {
        this.x = x; 
        this.y = y;
        
        const angle = Math.random() * Math.PI * 2;
        const vel = Math.random() * speed + (speed * 0.2); 
        
        this.vx = Math.cos(angle) * vel;
        this.vy = Math.sin(angle) * vel;
        
        this.color = color;
        this.size = size + Math.random() * 2; 
        this.life = 1.0; 
        this.lifeDecay = lifeDecay; 
        
        this.isActive = true;
    }

    update(deltaTime) {
        if (!this.isActive) return;
        
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        this.vx *= 0.95;
        this.vy *= 0.95;
        
        this.life -= this.lifeDecay * deltaTime;
        if (this.life <= 0) {
            this.isActive = false;
        }
    }
}