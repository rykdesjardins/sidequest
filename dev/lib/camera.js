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
        let half  = this.rect.w / 2;
        let halfy = this.rect.h / 2;
        let realx = this.following.vector.x - this.rect.x;
        let realy = this.following.vector.y - this.rect.y;

        if (realx > half + this.following.rect.x) {
            this.rect.x += realx - this.following.rect.x - half;
        } else if (realx + this.following.rect.x < half) {
            this.rect.x -= half - (realx + this.following.rect.x);
        }

        if (realy > halfy) {
            this.rect.y += realy - halfy;
        } else if (realy + this.following.rect.y < halfy) {
            this.rect.y -= halfy - (realy + this.following.rect.y);
        }

        if (this.rect.x < 0) {
            this.rect.x = 0;
        }

        if (this.rect.y > 0) {
            this.rect.y = 0;
        }
    }

    update() {
        this.following && this.updateFromBound();
    }
}

module.exports = Camera;
