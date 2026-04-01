export class ObjectPool {
    constructor(type, quantity, stats) {
        this.type = type;
        this.pool = [];
        this.quantity = quantity;
        this.stats = stats;
    }

    init() {
        for (let i = 0; i < this.quantity; i++) {
            this.pool.push(new this.type(this.stats));
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
        
        // Ha nincs szabad elem, csinálunk egy újat dinamikusan
        if (!item) {
            item = new this.type(this.stats);
            this.pool.push(item);
        }

        item.isActive = true;
        return item; // <-- Ezt feltétlenül vissza kell adni!
    }
}