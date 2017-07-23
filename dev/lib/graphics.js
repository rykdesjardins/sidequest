const log = require('./log');

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
    }

    clear() {
        this.graphicselements.forEach(x => x.destroy());
        this.graphicselements = [];
        this._assocGE = {};
    }

    draw(context) {
        this.graphicselements.forEach(x => x.draw(context));
    }
}

class Graphics {
    constructor(context, options) {
        this.context = this.c = context;
        this.options = options;

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
    }

    clear() {
        this.c.fillStyle = this.options.bgcolor;
        this.c.fillRect(...this.rect);
    }

    addElement(layerid, elementid, element) {
        this.layers[layerid].addElement(elementid, element);
    }

    draw() {
        this.layers.forEach(x => x.draw(this.context));
    }
}

module.exports = Graphics;
