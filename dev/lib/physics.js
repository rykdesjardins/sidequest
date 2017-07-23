class Vector2D {
    constructor(x, y, destx, desty) {
        this.x = x;
        this.y = y;

        this.destx = destx;
        this.desty = desty;
    }

    at(x, y) {
        this.x = x;
        this.y = y;
    }

    to(destx, desty) {
        this.destx = destx;
        this.desty = desty;
    }

    length() {
        return Math.sqrt(Math.pow(this.x - this.destx, 2) + Math.pow(this.y - this.desty, 2));
    }
}

module.exports = { Vector2D };
