const log = require('./log');
const Physics = require('./physics');

class Camera {
    constructor(ox, oy, w, h, vmod) {
        this.rect = new Physics.Rect(0, 0, w, h);
        this.origin = new Physics.Vector2D(ox, oy);
        this.limits = new Physics.Vector2D(w, h);
        this.vmod = vmod; 

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

    setLimits(vector) {
        this.limits = vector;
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
        } else if (this.rect.x + this.rect.w > this.limits.x) {
            this.rect.x = this.limits.x - this.rect.w;
        }

        if (this.rect.y > 0) {
            this.rect.y = 0;
        } else if (this.rect.y - this.rect.h < -this.limits.y) {
            this.rect.y = -(this.limits.y - this.rect.h);
        }
    }

    update() {
        this.following && this.updateFromBound();
    }
}

module.exports = Camera;
