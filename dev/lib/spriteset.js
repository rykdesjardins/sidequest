const log = require('./log');
const Physics = require('./physics');
const DOM = require('./dom');
const Drawable = require('./abstract/drawable');

class SpriteState {
    constructor(bitmap, index) {
        this.bitmap = bitmap;
        this.index = index;
    }
}

class SpriteSet extends Drawable {
    constructor(type, urlscheme, totalstates, framestateupdate, noloop) {
        super();

        this.type = type;
        this.url = urlscheme;
        this.frame = 0;
        this.framestateupdate = framestateupdate || false;
        this.drew = 0;
        this.ready = false;
        this.totalstates = totalstates || 1;
        this.noloop = noloop;
        this.states = [];
        this.patterns = [];
        this.pattern = false;

        log('SpriteSet', 'Creating new Sprite Set from ' + this.url + ' with ' + this.totalstates + ' states');
        if (type === "singleimage") {
            // TODO : Handle multiple states in single image
        } else if (type === "file") {
            this.load();
        } else if (type === "fileset") {
            this.load();
        } else {
            throw new Error("Created a SpriteSet with an invalid type : " + type);
        }
    }

    get currentFrame() {
        return this.states[this.frame];
    }

    get currentPattern() {
        return this.patterns[this.frame];
    }

    getImageFromURL(url, send) {
        const img = new Image();
        img.onload = () => {
            createImageBitmap(img).then((bitmap) => {
                send(bitmap);
            });
        };

        img.src = url;
    }

    resetFrame() {
        this.frame = 0;
    }

    previousFrame() {
        this.frame--;
        if (this.frame < 0) {
            this.frame = this.totalstates - 1;
        }
    }

    nextFrame() {
        this.frame++;
        if (this.frame == this.totalstates) {
            this.frame = this.noloop ? this.frame -1 : 0;
        }
    }

    load(done) {
        if (this.type == "singleimage") {
            // TODO : Handle loading states from one image
        } else {
            log('SpriteSet', 'Loading states from url scheme ' + this.url);
            let imageIndex = -1;
            const loadNextImage = () => {
                if (++imageIndex == this.totalstates) {
                    this.onready && this.onready();

                    this.ready = true;
                    log('SpriteSet', 'Done loading states for SpriteSet with url ' + this.url);

                    return done && done();
                }

                this.getImageFromURL(this.url.replace('$', imageIndex+1), (bitmap) => {
                    this.states.push(bitmap);
                    loadNextImage();
                });
            };

            loadNextImage();
        }
    }

    createPattern(context, imagesize) {
        this.pattern = true;

        const actuallyCreatePattern = () => {
            this.states.forEach(state => {
                const offCanvas = DOM.create({ node : "canvas" });
                if (!imagesize) {
                    imagesize = new Physics.Vector2D(state.width, state.height);
                }

                offCanvas.width = imagesize.x;
                offCanvas.height = imagesize.y;
                offCanvas.getContext('2d').drawImage(state, 0, 0, imagesize.x, imagesize.y);

                this.patterns.push( {
                    pattern : context.createPattern(offCanvas, "repeat"),
                    canvas : offCanvas
                });
            });

            log('SpriteSet', 'Loaded pattern for ' + this.states.length + " states");
        };

        if (this.ready) {
            actuallyCreatePattern();
        } else {
            this.onready = actuallyCreatePattern;
        }
    }

    draw(context, x, y, w, h) {
        if (!this.ready) {
            return;
        }

        x = x || 0;
        y = y || 0;
        w = w || this.currentFrame.width;
        h = h || this.currentFrame.height;
        if (this.pattern) {
            context.fillStyle = this.currentPattern.pattern;
            context.fillRect(x, y, w, h);
        } else {
            context.drawImage(this.currentFrame, x, y, w, h);
        }
        this.drew++;
        if (this.framestateupdate && this.drew == this.framestateupdate) {
            this.drew = 0;
            this.nextFrame();
        }

        return new Physics.Rect(x, y, w, h);
    }

    destroy() {
        this.patterns.forEach(pat => {
            pat.canvas.remove();
            pat.pattern = undefined;  // Not sure if necessary
        });
    }
}

module.exports = SpriteSet;
