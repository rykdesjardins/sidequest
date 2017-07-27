const log = require('./log');
const d = require('./dom');
const Physics = require('./physics');
const Keyboard = require('./keyboard');
const Sprite = require('./sprite');
const SpriteSet = require('./spriteset');

const defaultoptions = () => {
    return {
        x : 0, y : 0, w : 0, h : 0,
        initspeed : 1,
        maxspeed : 3,
        gravity : 0,
        strength : 500,
        jumpheight : 0,
        controlled : false,
        useimagesize : false,
        friction : 0.2,
        override : {}
    }
};

const defaulteffects = () => {
    return { opacity : 1.0 };
}

class GraphicElement {
    constructor(game, type, extra = {}) {
        this.game = game;
        this.type = type;
        this.options = Object.assign(defaultoptions(), extra);
        this.vector = new Physics.Vector2D(this.options.x, this.options.y);
        this.rect = new Physics.Vector2D(this.options.w, this.options.h);
        this.collision = this.options.collision || new Physics.Rect(0, 0, this.rect.x, this.rect.y);
        this.strength = this.options.strength;
        this.effects = Object.assign(defaulteffects(), {});
        this.sticked = false;

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
        return this.sticked;
    }

    update() {
        this.vector.update();

        if (this.options.gravity && this.vector.y + this.rect.y > this.game.height) {
            this.vector.y = this.game.height - this.rect.y;
            this.vector.vely = 0;
            this.sticked = true;
        }

        return this;
    }

    updateState() {
        if (this.vector.vely < 0) {
            this.sprite.changeState('jumping');
            this.sticked = false;
        } else if (this.vector.vely > 0) {
            this.sticked = false;
            this.sprite.changeState('falling');
        } else if (this.vector.velx != 0) {
            this.sprite.changeState('running');
        } else {
            this.sprite.changeState('neutral');
        }
    }

    shouldBeDrawn(camera) {
        return this.vector.x - camera.rect.x + this.rect.x > 0 && this.vector.x - camera.rect.x < camera.rect.w &&
            this.vector.y - camera.rect.y + this.rect.y > 0 && this.vector.y - camera.rect.y < camera.rect.h;
    }

    get collisionPoints() {
        return [
            [this.vector.x + this.collision.x + this.collision.w, this.vector.y + this.collision.y],
            [this.vector.x + this.collision.x, this.vector.y + this.collision.y],
            [this.vector.x + this.collision.x, this.vector.y + this.collision.y + this.collision.h],
            [this.vector.x + this.collision.x + this.collision.w, this.vector.y + this.collision.y + this.collision.h]
        ]
    }

    collide(context, gelement) {
        if (this.strength <= gelement.strength) {
            let A = this.collisionPoints;
            let B = gelement.collisionPoints;
            let C = [
                A[0][0] - B[2][0], A[0][1] - B[2][1],
                A[1][0] - B[3][0], A[1][1] - B[3][1],
                A[2][0] - B[0][0], A[2][1] - B[0][1],
                A[3][0] - B[1][0], A[3][1] - B[1][1]
            ];

            let smallindex = 0;
            let smallest = C[smallindex];
            for (let i = 1; i < C.length; i++) {
                if (Math.abs(C[i]) < smallest) {
                    smallindex = i;
                    smallest = Math.abs(C[i]);
                } 
            }

            if (smallindex % 2 == 0) {
                this.vector.velx = 0;
                this.vector.accelx = 0;
                this.vector.x -= C[smallindex];
            } else {
                if (this.vector.vely > 0) {
                    this.sticked = true;
                }

                this.vector.vely = 0;
                this.vector.y -= C[smallindex];
            }
        }
    }

    collisionBox(camera) {
        return new Physics.Rect(
            this.vector.x - camera.rect.x + this.collision.x, 
            this.vector.y - camera.rect.y + this.collision.y,
            this.collision.w,
            this.collision.h
        );
    }

    debug(context, camera, drawn) {
        const pos = {x : this.vector.x - camera.rect.x, y : this.vector.y - camera.rect.y, w : this.rect.x, h : this.rect.y};

        if (drawn) {
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

            context.beginPath();
            context.rect(
                pos.x, 
                pos.y, 
                pos.w, 
                pos.h
            );
            context.lineWidth = 1;
            context.strokeStyle = 'blue';
            context.stroke();
        }

        context.font = "12px Arial, sans-serif";
        context.fillStyle = "black";
        context.fillText("Relative " + this.vector.x + " x " + this.vector.y, pos.x + pos.w + 5, pos.y + 10);
        context.fillText("Real " + (this.vector.x - camera.rect.x) + " x " + (this.vector.y - camera.rect.y), pos.x + pos.w + 5, pos.y + 24);
        context.fillText("Velocity " + this.vector.velx + " x " + this.vector.vely, pos.x + pos.w + 5, pos.y + 38);
        context.fillText("Acceleration " + this.vector.accelx + " x " + this.vector.accely, pos.x + pos.w + 5, pos.y + 52);
        context.fillText("State : " + this.sprite.state + (this.controlled ? ", controlled" : ""), pos.x + pos.w + 5, pos.y + 66);
        context.fillText("Drawn : " + (drawn ? "Yes" : "No"), pos.x + pos.w + 5, pos.y + 80);
    }

    draw(context, camera) {
        let drawn = false;
        if (this.shouldBeDrawn(camera)) {
            const pos = this.sprite.draw(context, this.vector.x - camera.rect.x, this.vector.y - camera.rect.y, this.rect.x, this.rect.y);
            drawn = !!pos;
            if (this.options.useimagesize && pos) {
                this.rect.x = pos.w;
                this.rect.y = pos.h;
            }
        }

        if (this.game.options.env == "dev") {
            this.debug(context, camera, drawn);
        }

        return drawn;
    }

    override(action, callback) {
        this.override[action] = callback;
    }

    jump() {
        if (this.isOnFloor()) {
            this.sticked = false;
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
                    this.sprite.changeState(this.sprite.state, "right");
                    break;

                case Keyboard.KEY_LEFT : 
                    // this.vector.setVelocity(-this.options.initspeed, this.vector.vely);
                    this.direction = "left";
                    this.keydown = true;
                    this.vector.setAcceleration(-this.options.friction, this.vector.accely);
                    this.sprite.changeState(this.sprite.state, "left");
                    break;

                case Keyboard.KEY_SPACE:
                case Keyboard.KEY_UP:
                    this.jump();
                    break;

                default:
            }
        } else if (this.keydown && (which == Keyboard.KEY_LEFT || which == Keyboard.KEY_RIGHT)) {
            this.keydown = false;
            let mod = this.direction == "left" ? 1 : -1;

            if ( (mod == -1 && this.vector.velx > 0) || (mod == 1 && this.vector.velx < 0) ) {
                this.vector.setAcceleration(this.options.friction * mod, this.vector.accely, true);
            } else if (this.vector.velx != 0) {
                this.vector.setAcceleration(this.options.friction * -mod, this.vector.accely, true);
            }

            this.sprite.changeState();
        }
    }

    control(keyboard, options = {}) {
        this.controlled = true;
        this.keyboard = keyboard;
        
        log('GElement', "Binding Graphic Element with keyboard controls");
        if (options.arrows) {
            this.keventleft  = (which, pressed, fromup) => this.keyCommand(which, pressed, fromup); 
            this.keventright = (which, pressed, fromup) => this.keyCommand(which, pressed, fromup); 
            this.keventup    = (which, pressed, fromup) => this.keyCommand(which, pressed, fromup); 
            this.keventspace = (which, pressed, fromup) => this.keyCommand(which, pressed, fromup); 

            keyboard.bindKey('left',  this.keventleft );
            keyboard.bindKey('right', this.keventright);
            keyboard.bindKey('up',    this.keventup   );
            keyboard.bindKey('space', this.keventspace);
        }
    }

    giveupControll() {
        keyboard.killKey('left', this.keventleft );
        keyboard.killKey('right',this.keventright);
        keyboard.killKey('up',   this.keventup   );
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
