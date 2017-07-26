const log = require('./log');
const Physics = require('./physics');

class Camera {
    constructor(w, h) {
        this.rect = new Physics.Rect(0, 0, w, h);
        this.following;
        this.locked = false;
    }

    lock() { this.locked = true; } 
    unlock() { this.locked = false; } 

    follow(gelement) {
        this.following = gelement;
    }

    resize(w, h) {
        this.rect.w = w;
        this.rect.h = h;
    }

    updateFromBound() {
        let half = this.rect.w / 2;
        let realx = this.following.vector.x - this.rect.x;

        if (realx > half + this.following.rect.x) {
            this.rect.x += realx - this.following.rect.x - half;
        } else if (realx + this.following.rect.x < half) {
            this.rect.x -= half - (realx + this.following.rect.x);
        }

        if (this.rect.x < 0) {
            this.rect.x = 0;
        }
    }

    update() {
        this.following && this.updateFromBound();
    }
}

module.exports = Camera;
