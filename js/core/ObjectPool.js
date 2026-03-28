export class ObjectPool {
    constructor(type, quantity) {
        this.type = type;
        this.pool = [];
        this.quantity = quantity;
    }

    init() {
        for (let i = 0; i < this.quantity; i++) {
            this.pool.push(new this.type);
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
        let item;
        if (this.pool.length > 0) {
            item = this.pool.find(item => item.isActive === false)
            if (!item) {
                this.pool.push(new this.type)
                item = this.pool[this.pool.length - 1];
            }

            item.isActive = true;
            return item;
        }
    }
}