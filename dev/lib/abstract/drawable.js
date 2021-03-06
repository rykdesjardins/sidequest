class Drawable {
    constructor() {
        this.hooks = {
            collide : []
        };

        this.state = "neutral";
        this.facing = "right";

        this.initialstate = this.state;
    }

    draw(context, x, y, w, h, camera) {
        return {x, y, w, h};
    }

    on(hookname, callback) {
        if (!this.hooks[hookname]) {
            this.hooks[hookname] = [];
        }

        this.hooks[hookname].push(callback);
    }

    collide(gelement, direction) {
        let defaultCollision = true;
        this.hooks.collide.forEach(callback => {
            if (!callback(this, gelement, direction)) {
                defaultCollision = false;
            }
        });

        return defaultCollision;
    }

    addState() {}
    changeState() {}
    updateState() {}
    destroy() {}
    
    get currentState() { return this.state; }
    get alwaysDraw() { return false; }
}

module.exports = Drawable;
