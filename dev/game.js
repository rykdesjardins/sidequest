const glob = require('./lib/glob');
const log = require('./lib/log');
const Debugger = require('./lib/debugger');
const Mouse = require('./lib/mouse');
const Graphics = require('./lib/graphics');
const SpriteSet = require('./lib/spriteset');
const Sprite = require('./lib/sprite');
const GraphicElement = require('./lib/gelement');
const Physics = require('./lib/physics');
const Keyboard = require('./lib/keyboard');
const World = require('./lib/world');
const Audio = require('./lib/audio');

class Game {
    static defaults() {
        return {
            bgcolor : "#eaeff2",
            fps : 60,
            env : "prod"
        };
    }

    // Argument is either an element ID, or an element
    constructor(domid, options = {}) {
        this.canvas = typeof domid == "string" ? document.getElementById(domid) : domid;
        if (!this.canvas) {
            throw new Error("Undefined canvas ID");
        }

        this.context = this.c = this.canvas.getContext('2d');
        this.options = Object.assign(Game.defaults(), options);
        this.gamedebugger = new Debugger(this.canvas);

        this.mouse = new Mouse(this.canvas);
        this.keyboard = new Keyboard(this.canvas);
        this.world = new World(this.context, this.options.world);

        if (this.options.env === "dev") {
            this.dev = true;
            this.gamedebugger.cast();
        }

        this.timing = {
            delta : 0,
            ctime : 0,
            frame : 0,
            framerate : 1000 / this.options.fps
        };

        this.width  = this.options.width  || this.canvas.style.width  || this.canvas.width  || glob.innerWidth;
        this.height = this.options.height || this.canvas.style.height || this.canvas.height || glob.innerHeight;

        this.bindResize();
        this.resize();
    }

    resize() {
        const width  = this.width;
        const height = this.height;

        this.canvas.width  = width;
        this.canvas.height = height;       
        
        this.world.resize(width, height);
        log("Game", `Handled resized at ${width} x ${height}`);
    }

    bindResize() {
        glob.addEventListener('resize', () => this.resize());
    }

    start() {
        log("Game", "Starting engine");
        if (!this.world.hasStage()) {
            throw new Error("[Game] Cannot start game without a stage");
        }

        this.resize();
        this.frameRequest = requestAnimationFrame((time) => {this.draw(time)});
        return this;
    }

    update() {
        this.gamedebugger.ping();
        this.world.update();
        return this;
    }

    draw(time) {
        let delta = this.timing.ctime - time;
        if (delta < this.timing.framerate) {
            this.timing.ctime = time;
            this.timing.frame++;

            this.update();
            this.world.draw();
        }

        this.frameRequest = requestAnimationFrame((time) => {this.draw(time)});
        return this;
    }
}

glob.SideQuest = { Game, SpriteSet, Sprite, GraphicElement, Physics, Keyboard, Mouse, World, Audio, log }
