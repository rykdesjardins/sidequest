const log = require('./log');
const Physics = require('./physics');

class SpriteState {
    constructor(bitmap, index) {
        this.bitmap = bitmap;
        this.index = index;
    }
}

class SpriteSet {
    constructor(type, urlscheme, totalstates, framestateupdate, noloop) {
        this.type = type;
        this.url = urlscheme;
        this.frame = 0;
        this.framestateupdate = framestateupdate || false;
        this.drew = 0;
        this.ready = false;
        this.totalstates = totalstates || 1;
        this.noloop = noloop;
        this.states = [];

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

    draw(context, x, y, w, h) {
        if (!this.ready) {
            return;
        }

        x = x || 0;
        y = y || 0;
        w = w || this.currentFrame.width;
        h = h || this.currentFrame.height;
        context.drawImage(this.currentFrame, x, y, w, h);
        this.drew++;
        if (this.framestateupdate && this.drew == this.framestateupdate) {
            this.drew = 0;
            this.nextFrame();
        }

        return new Physics.Rect(x, y, w, h);
    }

    destroy() {
        
    }
}

module.exports = SpriteSet;
