export class ObjectPool {
    // 1. A harmadik paraméter most már egy 'config' objektum lesz!
    constructor(type, quantity, config) { 
        this.type = type;
        this.pool = [];
        this.quantity = quantity;
        
        // 2. Kiszerezzük a configból az engine-t és a stats-ot
        if (config && config.engine) {
            this.engine = config.engine;
            this.stats = config.stats;
        } else {
            // Kompatibilitás a régi ProjectilePool hívással, ahol csak 'this'-t adtál be
            this.engine = config; 
        }
    }

    init() {
        for (let i = 0; i < this.quantity; i++) {
            // 3. Átadjuk az engine-t és a statokat is a konstruktornak!
            this.pool.push(new this.type(this.engine, this.stats));
        }
    }

    release(item) {
        item.isActive = false;
    }

    releaseAll() {
        this.pool.forEach(item => {
            item.isActive = false;
        });
    }

    get() {
        let item = this.pool.find(item => item.isActive === false);
        
        if (!item) {
            // 4. Itt is átadjuk a paramétereket!
            item = new this.type(this.engine, this.stats);
            this.pool.push(item);
        }

        item.isActive = true;
        return item; 
    }
}