const log = require('./log');
const d = require('./dom');
const Physics = require('./physics');
const Keyboard = require('./keyboard');
const Sprite = require('./sprite');
const SpriteSet = require('./spriteset');

const defaultoptions = {
    x : 0, y : 0, w : 0, h : 0,
    initspeed : 1,
    maxspeed : 3,
    gravity : 0,
    jumpheight : 0,
    controlled : false,
    useimagesize : false,
    friction : 0.2,
    override : {}
};

class GraphicElement {
    constructor(game, type, extra) {
        this.game = game;
        this.type = type;
        this.options = Object.assign(defaultoptions, extra || {});
        this.vector = new Physics.Vector2D(this.options.x, this.options.y);
        this.rect = new Physics.Vector2D(this.options.w, this.options.h);
        this.collision = this.options.collision || new Physics.Rect(0, 0, this.rect.x, this.rect.y);

        this.vector.setMaxVelocity(this.options.maxspeed, this.options.maxgravity);

        this.controlled = this.options.controlled;
        this.options.gravity && this.applyGravity(this.options.gravity);

        switch (this.type) {
            case "image":
                this.initImage();
                break;

            case "sprite":
                this.initSprite();
                break;

            // TODO : Handle vector shapes
            case "shape": 
                this.initShape(extra);
                break;

            default:
                throw new Error("GElement was created without an invalid type : " + this.type);
        }

        log('GElement', "Created a new Graphic Element of type " + this.type);
    }

    get ready() {
        return this.sprite.currentState.ready;
    }

    setPosition(x, y) {
        this.vector.at(x, y);
    }

    initSprite() {
        this.sprite = this.options.sprite;
    }

    initImage() {
        this.url = this.options.url;

        this.sprite = new Sprite({
            spritesets : {
                neutral : new SpriteSet('file', this.url)
            },
            useimagesize : this.options.useimagesize
        });

        log('GElement', "Initialized Graphic Element with image at " + this.url);
    }

    applyGravity(gravity) {
        this.vector.setAcceleration(this.vector.accelx, gravity);
    }

    initShape(info) {

    }

    isOnFloor() {
        return this.vector.y >= (this.game.height - this.rect.y);
    }

    update() {
        if (this.options.gravity) {
            if (this.isOnFloor()) {
                this.vector.y = this.game.height - this.rect.y;
                this.vector.vely = 0;
            }

            if (this.sprite) {
                if (this.vector.vely > 0) {
                    this.sprite.changeState('jumping');
                } else if (this.vector.vely < 0) {
                    this.sprite.changeState('falling');
                } else if (this.vector.velx != 0) {
                    this.sprite.changeState('running');
                } else {
                    this.sprite.changeState('neutral');
                }
            }
        }
    }

    draw(context) {
        this.vector.update();
        this.update();
        const pos = this.sprite.draw(context, this.vector.x, this.vector.y, this.rect.x, this.rect.y);

        if (pos) {
            if (this.game.options.env == "dev") {
                context.beginPath();
                context.rect(
                    this.collision.x + pos.x, 
                    this.collision.y + pos.y, 
                    this.collision.w || pos.w, 
                    this.collision.h || pos.h
                );
                context.lineWidth = 1;
                context.strokeStyle = 'red';
                context.stroke();
            }
        }
    }

    override(action, callback) {
        this.override[action] = callback;
    }

    jump() {
        if (this.isOnFloor()) {
            if (this.override.jump) {
                this.override.jump();
            } else {
                this.vector.vely = -this.options.jumpheight;
            }
        }
    }

    keyCommand(which, pressed, fromUp) {
        if (pressed) {
            switch (which) {
                case Keyboard.KEY_RIGHT : 
                    // this.vector.setVelocity(this.options.initspeed, this.vector.vely);
                    this.direction = "right";
                    this.keydown = true;
                    this.vector.setAcceleration(this.options.friction, this.vector.accely);
                    if (this.sprite) {
                        this.sprite.changeState(this.sprite.state, "right");
                    }
                    break;

                case Keyboard.KEY_LEFT : 
                    // this.vector.setVelocity(-this.options.initspeed, this.vector.vely);
                    this.direction = "left";
                    this.keydown = true;
                    this.vector.setAcceleration(-this.options.friction, this.vector.accely);
                    if (this.sprite) {
                        this.sprite.changeState(this.sprite.state, "left");
                    }
                    break;

                case Keyboard.KEY_SPACE:
                    this.jump();
                    break;

                default:
            }
        } else if (this.keydown && (which == Keyboard.KEY_LEFT || which == Keyboard.KEY_RIGHT)) {
            this.keydown = false;
            let mod = this.direction == "left" ? 1 : -1;

            if ( (mod == -1 && this.vector.velx > 0) || (mod == 1 && this.vector.velx < 0) ) {
                this.vector.setAcceleration(this.options.friction * mod, this.vector.accely, true);
            } else {
                this.vector.setAcceleration(this.options.friction * -mod, this.vector.accely, true);
            }

            if (this.sprite) {
                this.sprite.changeState();
            }
        }
    }

    control(keyboard, options = {}) {
        this.controlled = true;
        this.keyboard = keyboard;
        
        log('GElement', "Binding Graphic Element with keyboard controls");
        if (options.arrows) {
            this.keventleft  = (which, pressed, fromup) => this.keyCommand(which, pressed, fromup); 
            this.keventright = (which, pressed, fromup) => this.keyCommand(which, pressed, fromup); 
            this.keventspace = (which, pressed, fromup) => this.keyCommand(which, pressed, fromup); 

            keyboard.bindKey('left',  this.keventleft);
            keyboard.bindKey('right', this.keventright);
            keyboard.bindKey('space', this.keventspace);
        }
    }

    giveupControll() {
        keyboard.killKey('left', this.keventleft);
        keyboard.killKey('right',this.keventright);
        keyboard.killKey('space',this.keventspace);
    }

    destroy() {
        log('GElement', 'Destroyed Graphic Element of type ' + this.type);
        this.imagebitmap && this.imagebitmap.close();
        this.image && this.image.remove();
        if (this.controlled) {
            this.giveupControll();
        }
    }
}

module.exports = GraphicElement;
