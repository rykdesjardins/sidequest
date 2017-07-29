const log = require('./log');
const Physics = require('./physics');
const Drawable = require('./abstract/drawable');

class Sprite extends Drawable {
    constructor(options = {}) {
        super(options);

        this.options = options;

        this.state = options.state || "neutral";
        this.facing = options.facing || "right";
        this.initialstate = this.state;
        this.pattern = options.pattern;
        this.spritesets = {};

        for (let name in options.spritesets || {}) {
            this.addState(name, options.spritesets[name]);
        }
    }

    createPattern(context, size) {
        this.pattern = true;
        for (let name in this.spritesets) {
            this.spritesets[name].createPattern(context, size);
        }
    }

    addState(statename, spriteset) {
        this.spritesets[statename] = spriteset;
    }

    changeState(statename, facing) {
        let ogstate = this.state;
        this.state = statename || this.initialstate;
        this.facing = facing || this.facing;

        if (!this.currentState) {
            this.spritesets[this.state] = this.spritesets["neutral"];
        }

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
        let pos;
        context.save();
        if (this.facing == "right") {
            if (this.useimagesize) {
                pos = this.currentState.draw(context, x, y);
            } else {
                pos = this.currentState.draw(context, x, y, w, h);
            }
        } else if (this.facing == "left") {
            context.scale(-1, 1);
            if (this.useimagesize) {
                pos = this.currentState.draw(context, -x-w, y);
            } else {
                pos = this.currentState.draw(context, -x-w, y, w, h);
            }
            pos.x = x;
        }
        context.restore();

        return pos;
    }
}

module.exports = Sprite;
