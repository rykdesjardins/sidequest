class Vector2D {
    constructor(x, y, destx, desty) {
        this.x = x;
        this.y = y;

        this.destx = destx;
        this.desty = desty;

        this.velx = 0;
        this.vely = 0;

        this.accelx = 0;
        this.accely = 0;

        this.maxvelx;
        this.maxvely;
    }

    at(x, y) {
        this.x = x;
        this.y = y;
    }

    to(destx, desty) {
        this.destx = destx;
        this.desty = desty;
    }

    setMaxVelocity(x, y) {
        this.maxvelx = x;
        this.maxvely = y;
    }

    setVelocity(x, y) {
        this.velx = x;
        this.vely = y;
    }

    setAcceleration(x, y, breakatzerox, breakatzeroy) {
        this.accelx = x;
        this.accely = y;

        this.breakatzerox = breakatzerox;
        this.breakatzeroy = breakatzeroy;
    }

    update() {
        let ogvelx = this.velx;
        let ogvely = this.vely;

        this.velx += this.accelx;
        this.vely += this.accely;

        if (this.maxvelx && Math.abs(this.velx) > this.maxvelx) {
            this.velx = this.maxvelx * (this.velx < 0 ? -1 : 1);
        }
        if (this.maxvely && Math.abs(this.vely) > this.maxvely) {
            this.vely = this.maxvely * (this.vely < 0 ? -1 : 1);
        }

        if (this.breakatzerox && ((ogvelx > 0 && this.velx <= 0) || (ogvelx < 0 && this.velx >= 0))) {
            this.accelx = 0;
            this.velx = 0;
        }

        if (this.breakatzeroy && ((ogvely > 0 && this.vely < 0) || (ogvely < 0 && this.vely > 0))) {
            this.accely = 0;
            this.vely = 0;
        }

        this.x += this.velx;
        this.y += this.vely;
    }

    length() {
        return Math.sqrt(Math.pow(this.x - this.destx, 2) + Math.pow(this.y - this.desty, 2));
    }
}

class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

module.exports = { Vector2D, Rect };
