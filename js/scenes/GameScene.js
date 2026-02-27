// import { ObjectPool } from '../core/ObjectPool.js';
// import { Bullet } from '../entities/Bullet.js';
// import { Enemy } from '../entities/Enemy.js';

import { SettingsScene } from "./SettingsScene.js";

export class GameScene {

    constructor(engine) {
        this.engine = engine;

        /*
        this.bulletPool = new ObjectPool(Bullet, 200);
        this.enemyPool = new ObjectPool(Enemy, 50);
        
        this.entities = []; // Minden aktív dolog listája
        */
    }

    init() {
        this.engine.uiManager.showScreen('hud');
        this.engine.uiManager.bindButtonEvents({
            onPause: () => this.engine.changeScene('pause')
        });
    }

    spawnBullet(x, y, targetX, targetY) {
        /*
        const bullet = this.bulletPool.get();
        bullet.spawn(x, y, targetX, targetY);
        // Hozzáadjuk az aktív listához, hogy tudjuk frissíteni
        if (!this.entities.includes(bullet)) {
            this.entities.push(bullet);
        }
        */
    }

    update() {
        /*
        // Csak az aktív elemeket frissítjük
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const ent = this.entities[i];
            
            if (ent.active) {
                ent.update();
            } else {
                // Ha inaktív lett (pl. kiment a képből), 
                // kivehetjük az aktív frissítési listából (opcionális optimalizáció)
                this.entities.splice(i, 1);
            }
        }
        */

        this.currentScene.update(this.engine.input);

    }

    draw(ctx) {
        /*
       this.entities.forEach(ent => {
           if (ent.active) ent.draw(ctx);
       });
       */
    }

}