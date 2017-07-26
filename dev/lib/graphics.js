const log = require('./log');
const Camera = require('./camera');

class GraphicLayer {
    constructor(index) {
        this.index = index;

        this.graphicselements = [];
        this._assocGE = {};
    }

    addElement(id, gelement) {
        log('GraphicLayer', "Added an element to layer " + this.index + " with id " + id);
        this.graphicselements.push(gelement);
        this._assocGE[id] = gelement;

        return this;
    }

    clear() {
        this.graphicselements.forEach(x => x.destroy());
        this.graphicselements = [];
        this._assocGE = {};

        return this;
    }

    impactCheck() {
        for (let i = 0; i < this.graphicselements.length; i++) {
            for (let j = i; j < this.graphicselements.length; j++) {
                // Check for collision
            }
        }
        return this;
    }

    draw(context, camera) {
        this.graphicselements.forEach(x => x.draw(context, camera));
        return this;
    }
}

class Graphics {
    constructor(context, options) {
        this.context = this.c = context;
        this.options = options;
        this.camera = new Camera(context.width, context.height);

        this.layers = [];
        this.fixedLayer = new GraphicLayer(-1);

        for (let i = 0; i < options.layers; i++) {
            this.layers.push(new GraphicLayer(i));
        }
    }

    resize(w, h) {
        this.w = w;
        this.h = h;
        this.rect = [0, 0, this.w, this.h];
        this.camera.resize(this.w, this.h);
    }

    clear() {
        this.c.fillStyle = this.options.bgcolor;
        this.c.fillRect(...this.rect);
    }

    addElement(layerid, elementid, element) {
        this.layers[layerid].addElement(elementid, element);
    }

    draw() {
        this.camera.update();
        this.layers.forEach(x => x.impactCheck().draw(this.context, this.camera));
    }
}

module.exports = Graphics;
