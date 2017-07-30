const log = require('./log');
const glob = require('./glob');
const Physics = require('./physics');
const Graphics = require('./graphics');
const GraphicElement = require('./gelement');
const Sprite = require('./sprite');
const SpriteSet = require('./spriteset');

class World {
    constructor(game, stages = {}) {
        this.context = game.context;
        this.audio = game.audio;
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

    appendFromRaw(game, raw) {
        log('World', 'Adding to World object from raw JSON data');
        if (raw.stages) {
            raw.stages.forEach(rawstage => {
                this.createStageFromRaw(game, rawstage);
            });
        }
    }

    createStageFromRaw(game, raw) {
        log('Stage', 'Building Stage object from raw JSON data');
        if (raw.options) {
            if (raw.options.size) {
                raw.options.size = new Physics.Vector2D(...raw.options.size);
            }
        }

        raw.resources && raw.resources.forEach(res => {
            switch(res.type) {
                case "audio":
                    game.audio.load(res.id, res.url);
                    break;
            }
        });

        raw.templates && raw.templates.forEach(template => {
            GraphicElement.createTemplate(template.id, template.type, template.options, template.filters);
        });

        const stage = this.createStage(raw.id, raw.options);

        raw.elements && raw.elements.forEach(element => {
            let elem;
            if (element.options && element.options.sprite) {
                let spritesets = {};
                if (element.options.sprite.spritesets) for (let state in element.options.sprite.spritesets) {
                    spritesets[state] = new SpriteSet(...element.options.sprite.spritesets[state]);
                }

                element.options.sprite = new Sprite({ spritesets });
            }

            if (element.options && element.options.collision) {
                element.options.collision = new Physics.Rect(...element.options.collision);
            }

            if (element.template) {
                elem = stage.addElement(element.layer, element.id, GraphicElement.fromTemplate(game, element.template, element.options));
            } else {
                elem = stage.addElement(element.layer, element.id, new GraphicElement(game, element.type, element.options));
            }

            if (element.on) {
                for (let hookname in element.on) {
                    elem.on(hookname, glob[element.on[hookname]]);
                }
            }

            if (element.controlled) {
                elem.control(game.keyboard, {arrows : true});
            }

            if (element.followed) {
                stage.follow(elem);
            }
        });

        if (stage.options.background) {
            const background = stage.addElementToFixed(stage.options.background.id, 
                GraphicElement.fromTemplate(game, stage.options.background.template, stage.options.background.options)
            );
        }

        return stage;
    }

    switchStage(id) {
        log('World', `Switching to stage with id ${id}`);
        if (!this.stages[id]) {
            throw new Error(`[World] Stage with id ${id} does not exist`);
        }

        this.currentStage && this.currentStage.fire("switchout");
        this.currentStage = this.stages[id];

        if (this.currentStage.options.song) {
            this.audio.play(this.currentStage.options.song, 0, 0, true);
        }

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
            song : undefined,
            hooks : {},
            layers : 5
        };
    }

    constructor(id, context, options = {}) {
        this.id = id;
        this.options = Object.assign(Stage.defaultOptions(), options);
        this.context = context;

        log('Stage', `Created Stage with size : ${this.options.size}`);
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
    addElementToFixed() { return this.graphics.addElementToFixed(...arguments); }
    follow() { return this.graphics.camera.follow(...arguments); }
}

module.exports = World;
