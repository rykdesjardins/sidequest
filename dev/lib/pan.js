const log = require('./log');
const Drawable = require('./abstract/drawable');
const Physics = require('./physics');

class Pan extends Drawable {
    static defaultoptions() {
        return {
            modifier : { x : 1, y : 1 },
            through : true
        }
    }

    constructor(options = {}) {
        super(...arguments);
        this.ready = false;
        this.options = Object.assign(Pan.defaultoptions(), options);
        this.bitmap;
        this.pattern;

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
        } else if (!this.pattern) {
            this.pattern = context.createPattern(this.bitmap, 'repeat');
        }

        const rect = [
            x * this.options.modifier.x, 
            y * this.options.modifier.y - (this.bitmap.height - camera.rect.h), 
            camera.rect.w,
            camera.rect.h
        ]

        context.fillStyle = this.pattern;
        context.translate(rect[0], rect[1]);
        context.fillRect(-rect[0], -rect[1], rect[2], rect[3]);
        context.translate(-rect[0], -rect[1]);

        return new Physics.Rect(...rect);
    }

    collide() {
        return false;
    }

    destroy() {

    }

    get alwaysDraw() { return true; }
}

module.exports = Pan;
