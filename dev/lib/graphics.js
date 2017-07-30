const log = require('./log');
const Camera = require('./camera');
const Physics = require('./physics');

class GraphicLayer {
    constructor(index, size) {
        this.index = index;
        this.size = size;

        this.graphicselements = [];
        this._assocGE = {};
    }

    addElement(id, gelement) {
        log('GraphicLayer', "Added an element to layer " + this.index + " with id " + id);
        this.graphicselements.push(gelement);
        this._assocGE[id] = gelement;

        return this;
    }

    destroy() {
        this.graphicselements.forEach(x => x.destroy());
        this.graphicselements = [];
        this._assocGE = {};

        return this;
    }

    impactCheck(context, camera) {
        for (let i = 0; i < this.graphicselements.length; i++) {
            this.graphicselements[i].options.fixedtostage && this.graphicselements[i].restrict(camera, this.size);
            if (this.graphicselements[i].options.through) { continue; }

            for (let j = i+1; j < this.graphicselements.length; j++) {
                if (this.graphicselements[j].options.through) { continue; }

                if (Physics.Collider.rectangles(
                        this.graphicselements[i].collisionBox(camera),
                        this.graphicselements[j].collisionBox(camera)
                    )
                ) {
                    this.graphicselements[i].collide(context, this.graphicselements[j]);
                    this.graphicselements[j].collide(context, this.graphicselements[i]);
                }
            }
        }
        return this;
    }

    updateStates() {
        this.graphicselements.forEach(x => x.updateState());
        return this;
    }

    update() {
        this.graphicselements.forEach(x => x.update());
        return this;
    }

    draw(context, camera) {
        this.graphicselements.forEach(x => x.draw(context, camera));
        return this;
    }
}

class Graphics {
    static defaultOptions() {
        return {
            bgcolor : "#E7E5E2"
        };
    }

    constructor(context, options = {}, size) {
        this.context = this.c = context;
        this.options = Object.assign(Graphics.defaultOptions(), options);
        this.size = size;
        this.camera = new Camera(options.origin.x, options.origin.y, context.width, context.height, options.verticalModifier);
        this.camera.setLimits(this.size);

        this.backLayer = new GraphicLayer(-2, size);
        this.layers = [];
        this.frontLayer = new GraphicLayer(-1, size);

        for (let i = 0; i < options.layers; i++) {
            this.layers.push(new GraphicLayer(i, size));
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

    addElementToFixed(elementid, element, front) {
        front ? this.frontLayer.addElement(elementid, element) : this.backLayer.addElement(elementid, element);
    }

    addElement(layerid, elementid, element) {
        element.id = elementid;
        this.layers[layerid].addElement(elementid, element);

        return element;
    }

    update() {
        this.camera.update();

        this.backLayer.update();
        this.layers.forEach(x => x.update().impactCheck(this.context, this.camera).updateStates());
        this.frontLayer.update();
    }

    draw() {
        this.backLayer.draw(this.context, this.camera);
        this.layers.forEach(x => x.draw(this.context, this.camera));
        this.frontLayer.draw(this.context, this.camera);
    }
}

module.exports = Graphics;
