const log = require('./log');
const Drawable = require('./abstract/drawable');
const Physics = require('./physics');

class Background extends Drawable {
    static defaultoptions() {
        return {
            modifier : { x : 1, y : 1 },
            through : true
        }
    }

    constructor(options = {}) {
        super(...arguments);
        this.ready = false;
        this.options = Object.assign(Background.defaultoptions(), options);
        this.bitmap;

        this.options.url && this.load(this.options.url);
    }

    load(url) {
        const img = new Image();
        img.onload = () => {
            createImageBitmap(img).then((bitmap) => {
                this.bitmap = bitmap;
                this.ready = true;
                this.onready && this.onready(bitmap);
            });
        }

        img.src = url;
    }

    draw(context, x, y, w, h, camera) {
        if (!this.ready) {
            return { x, y, w, h };
        }

        const rect = [
            x * this.options.modifier.x, 
            y * this.options.modifier.y - (this.bitmap.height - camera.rect.h), 
            this.bitmap.width, 
            this.bitmap.height
        ]
        context.drawImage( this.bitmap, ...rect );
        return new Physics.Rect(...rect);
    }

    collide() {
        return false;
    }

    get alwaysDraw() { return true; }
}

module.exports = Background;
