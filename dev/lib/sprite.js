const log = require('./log');
const Physics = require('./physics');

class Sprite {
    constructor(options = {}) {
        this.options = options;
        this.state = options.state || "neutral";
        this.initialstate = this.state;
        this.spritesets = options.spritesets || {};
        this.facing = options.facing || "right";
    }

    addState(statename, spriteset) {
        this.spritesets[statename] = spriteset;
    }

    changeState(statename, facing) {
        let ogstate = this.state;
        this.state = statename || this.initialstate;
        this.facing = facing || this.facing;

        if (ogstate != this.state) {
            this.currentState.resetFrame();
        }
    }

    get currentState() {
        return this.spritesets[this.state];
    }

    updateState() {
        this.currentState.nextFrame();
    }

    draw(context, x, y, w, h) {
        context.save();
        if (this.facing == "right") {
            this.currentState.draw(context, x, y, w, h);
        } else if (this.facing == "left") {
            context.scale(-1, 1);
            this.currentState.draw(context, -x - w, y, w, h);
        }
        context.restore();
    }
}

module.exports = Sprite;
