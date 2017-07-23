const log = require('./log');
const d = require('./dom');
const Physics = require('./physics');

class GraphicElement {
    constructor(type, extra) {
        this.ready = false;
        this.type = type;
        this.options = extra || {};
        this.vector = new Physics.Vector2D(this.options.x || 0, this.options.y || 0);
        this.rect = new Physics.Vector2D(this.options.w || 0, this.options.h || 0);

        switch (this.type) {
            case "image":
                this.initImage(this.options.url);
                this.options.preload && this.preload();
                break;

            case "sprite":
                this.initSprite(this.options.sprite);
                break;

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
        this.draw = this.drawSprite;
    }

    initImage(url) {
        this.url = url;
        this.image = new Image();
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
        this.imagebitmap && context.drawImage(this.imagebitmap, this.vector.x, this.vector.y, this.rect.x, this.rect.y);
    }

    drawSprite(context) {
        this.sprite.draw(context);
    }

    drawShape() {

    }

    draw(context) {
        throw new Error("Tried to draw a GElement with an invalid type : " + this.type);
    }

    destroy() {
        log('GElement', 'Destroyed Graphic Element of type ' + this.type);
        this.imagebitmap && this.imagebitmap.close();
        this.image && this.image.remove();
    }
}

module.exports = GraphicElement;
