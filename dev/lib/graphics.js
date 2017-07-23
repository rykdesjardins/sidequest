const log = require('./log');

class Graphics {
    constructor(context, options) {
        this.context = this.c = context;
        this.options = options;
    }

    resize(w, h) {
        this.w = w;
        this.h = h;
        this.rect = [0, 0, this.w, this.h];
    }

    clear() {
        this.c.fillStyle = this.options.bgcolor;
        this.c.fillRect(...this.rect);
    }
}

module.exports = Graphics;
