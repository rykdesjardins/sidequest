const log = require('./log');
const Physics = require('./physics');

class Sprite {
    constructor(options = {}) {
        this.options = options;
        this.state = options.state || "neutral";
        this.spritesets = options.spritesets || {};
        this.position = options.potision || new Physics.Vector2D(options.x || 0, options.y || 0);
        this.box = options.box || new Physics.Vector2D(options.w || 0, options.h || 0);
    }

    addState(statename, spriteset) {
        this.spritesets[statename] = spriteset;
    }

    changeState(statename) {
        this.state = statename;
    }

    get currentState() {
        return this.spritesets[this.state];
    }

    updateState() {
        this.currentState.nextFrame();
    }

    draw(context) {
        this.currentState.draw(context, this.position, this.box);
    }
}

module.exports = Sprite;
