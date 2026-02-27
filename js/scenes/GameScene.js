import { ObjectPool } from '../core/ObjectPool.js';
import { Bullet } from '../entities/Bullet.js';
// import { Enemy } from '../entities/Enemy.js';

import { Player } from "../entities/Player.js";

export class GameScene {

    constructor(engine) {
        this.engine = engine;
        this.player = new Player(engine);

        this.bulletPool = new ObjectPool(Bullet, 200);
        // this.enemyPool = new ObjectPool(Enemy, 50);
    
        this.entities = []; // Minden aktív dolog listája
    }

    init() {
        this.engine.uiManager.showScreen('hud');
        this.engine.uiManager.bindButtonEvents({
            onPause: () => this.engine.changeScene('pause')
        });
        this.entities.push(this.player);
    }

    spawnBullet(x, y, targetX, targetY) {
        const bullet = this.bulletPool.get();
        bullet.spawn(x, y, targetX, targetY);
        // Hozzáadjuk az aktív listához, hogy tudjuk frissíteni
        if (!this.entities.includes(bullet)) {
            this.entities.push(bullet);
        }
    }

    update() {
        // Frissítjük az összes aktív entitást
        this.entities.forEach(entity => {
            if (entity.active) {
                // Átadjuk az inputot a playernek
                entity.update(this.engine.input);
            }
        });

    }

    draw() {
       this.entities.forEach(entity => {
           if (entity.active) entity.draw();
       });
    }

}