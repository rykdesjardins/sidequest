const log = require('./log');
const Physics = require('./physics');
const Graphics = require('./graphics');

class World {
    constructor(context, stages = {}) {
        this.context = context;
        this.stages = stages;
        this.currentStage;
    }

    createStage(id, options = {}, overwrite, switchto) {
        if (!overwrite && this.stages[id]) {
            throw new Error(`[World] Stage with id ${id} already exists`);
        }

        const stage = new Stage(id, this.context, options);
        this.stages[id] = stage 
        stage.fire("added");

        switchto && this.switchStage(id);

        return stage;
    }

    switchStage(id) {
        if (!this.stages[id]) {
            throw new Error(`[World] Stage with id ${id} does not exist`);
        }

        this.currentStage && this.currentStage.fire("switchout");

        this.currentStage = this.stages[id];
        this.currentStage.fire("switchin");
    }

    resize(w, h) {
        for (let id in this.stages) {
            this.stages[id].graphics.resize(w, h);
        }
    }

    update() {
        this.stage.update();
    }

    draw() {
        this.stage.draw();
    }

    hasStage() {
        return !!this.currentStage;
    }

    get stage() {
        return this.currentStage;
    }
}

/*
 *  Events : added, switchout, switchin
 * */
class Stage {
    static defaultOptions() {
        return {
            size : new Physics.Vector2D(1920, 1080),
            origin : new Physics.Vector2D(0, 0),
            verticalModifier : 1,
            song : "",
            hooks : {},
            layers : 5
        };
    }

    constructor(id, context, options = {}) {
        this.id = id;
        this.options = Object.assign(Stage.defaultOptions(), options);
        this.context = context;

        this.graphics = new Graphics(this.context, this.options, this.options.size);
    }

    fire(event, extra) {
        const callback = this.options.hooks[event];
        callback && callback(extra);
    }

    on(event, callback) {
        this.hooks[event] = callback;
    }

    update() {
        this.graphics.update();
    }

    draw() {
        this.graphics.clear();
        this.graphics.draw();
    }

    // Shortcut
    addElement() { return this.graphics.addElement(...arguments); }
    follow() { return this.graphics.camera.follow(...arguments); }
}

module.exports = World;
