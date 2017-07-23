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
    }

    at(x, y) {
        this.x = x;
        this.y = y;
    }

    to(destx, desty) {
        this.destx = destx;
        this.desty = desty;
    }

    setVelocity(x, y) {
        this.velx = x;
        this.vely = y;
    }

    setAcceleration(x, y) {
        this.accelx = x;
        this.accely = y;
    }

    update() {
        this.velx += this.accelx;
        this.vely += this.accely;

        this.x += this.velx;
        this.y += this.vely;
    }

    length() {
        return Math.sqrt(Math.pow(this.x - this.destx, 2) + Math.pow(this.y - this.desty, 2));
    }
}

module.exports = { Vector2D };
