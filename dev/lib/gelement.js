const log = require('./log');
const d = require('./dom');
const Physics = require('./physics');
const Keyboard = require('./keyboard');

class GraphicElement {
    constructor(type, extra) {
        this.ready = false;
        this.type = type;
        this.options = extra || {};
        this.vector = new Physics.Vector2D(this.options.x || 0, this.options.y || 0);
        this.rect = new Physics.Vector2D(this.options.w || 0, this.options.h || 0);

        this.controlled = false;
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

    initShape(info) {

    }

    drawImage(context) {
        this.vector.update();
        this.imagebitmap && context.drawImage(this.imagebitmap, this.vector.x, this.vector.y, this.rect.x, this.rect.y);
    }

    drawSprite(context) {
        this.vector.update();
        this.sprite.draw(context, this.vector.x, this.vector.y, this.rect.x, this.rect.y);
    }

    drawShape(context) {

    }

    draw(context) {
        throw new Error("Tried to draw a GElement with an invalid type : " + this.type);
    }

    keyCommand(which) {
        switch (which) {
            case "right" : 
                this.vector.setVelocity(3, this.vector.vely);
                if (this.sprite) {
                    this.sprite.changeState(this.movingstate, "right");
                }
                break;

            case "left" : 
                this.vector.setVelocity(-3, this.vector.vely);
                if (this.sprite) {
                    this.sprite.changeState(this.movingstate, "left");
                }
                break;

            case "release":
                this.vector.setVelocity(0, this.vector.vely);
                if (this.sprite) {
                    this.sprite.changeState();
                }
                break;

            default:
        }
    }

    control(keyboard, options = {}) {
        this.controlled = true;
        this.keyboard = keyboard;
        this.movingstate = options.movingstate || "running";
        
        log('GElement', "Binding Graphic Element with keyboard controls");
        if (options.arrows) {
            this.keventleft  = () => { this.keyCommand('left');  };
            this.keventright = () => { this.keyCommand('right'); };

            keyboard.bindKey('left',  this.keventleft);
            keyboard.bindKey('right', this.keventright);
        }

        this.keventreleased = () => { this.keyCommand('release'); };
        keyboard.bindKeyUp(this.keventreleased);
    }

    giveupControll() {
        keyboard.killKey('left', this.keventleft);
        keyboard.killKey('right',this.keventright);
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
