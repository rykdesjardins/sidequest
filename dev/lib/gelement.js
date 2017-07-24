const log = require('./log');
const d = require('./dom');
const Physics = require('./physics');
const Keyboard = require('./keyboard');

const defaultoptions = {
    x : 0, y : 0, w : 0, h : 0,
    initspeed : 1,
    maxspeed : 3,
    gravity : 0,
    jumpheight : 0,
    controlled : false,
    friction : 0.2
};

class GraphicElement {
    constructor(game, type, extra) {
        this.game = game;
        this.ready = false;
        this.type = type;
        this.options = Object.assign(defaultoptions, extra || {});
        this.vector = new Physics.Vector2D(this.options.x, this.options.y);
        this.rect = new Physics.Vector2D(this.options.w, this.options.h);

        this.vector.setMaxVelocity(this.options.maxspeed, this.options.maxgravity);

        this.controlled = this.options.controlled;
        this.options.gravity && this.applyGravity(this.options.gravity);

        this.key;

        switch (this.type) {
            case "image":
                this.initImage(this.options.url);
                this.options.preload && this.preload();
                break;

            case "sprite":
                this.initSprite(this.options.sprite);
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

    setPosition(x, y) {
        this.vector.at(x, y);
    }

    initSprite(sprite) {
        this.sprite = sprite;
        this.key = sprite;
        this.draw = this.drawSprite;
    }

    initImage(url) {
        this.url = url;
        this.image = new Image();
        this.key = this.image;
        this.draw = this.drawImage;
        log('GElement', "Initialized Graphic Element with image at " + this.url);
    }

    preload() {
        this.image.onload = () => {
            createImageBitmap(this.image).then((imgbitmap) => {
                this.imagebitmap = imgbitmap;
                if (!this.rect.w && !this.rect.h) {
                    this.rect.at(this.imagebitmap.width, this.imagebitmap.height);
                }

                log('GElement', "Preloaded Graphic Element with image at " + this.url);
                this.ready = true;
                this.options.preloadcallback && this.options.preloadcallback(this);
            });
        }

        this.image.src = this.url;
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

    drawImage(context) {
        this.vector.update();
        this.update();
        this.imagebitmap && context.drawImage(this.imagebitmap, this.vector.x, this.vector.y, this.rect.x, this.rect.y);
    }

    drawSprite(context) {
        this.vector.update();
        this.update();
        this.sprite.draw(context, this.vector.x, this.vector.y, this.rect.x, this.rect.y);
    }

    drawShape(context) {

    }

    draw(context) {
        throw new Error("Tried to draw a GElement with an invalid type : " + this.type);
    }

    jump() {
        if (this.isOnFloor()) {
            this.vector.vely = -this.options.jumpheight;
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
