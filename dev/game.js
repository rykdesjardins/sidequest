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

class Game {
    static defaults() {
        return {
            bgcolor : "#eaeff2",
            fps : 60,
            layers : 5,
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

        this.graphics = new Graphics(this.context, this.options);
        this.mouse = new Mouse(this.canvas);
        this.keyboard = new Keyboard(this.canvas);

        if (this.options.env == "dev") {
            glob.__SIDESCROLLGAME.env == "dev";
            this.gamedebugger.cast();
        } else {
            glob.__SIDESCROLLGAME.env == this.options.env || "prod";
        }

        this.timing = {
            delta : 0,
            ctime : 0,
            frame : 0,
            framerate : 1000 / this.options.fps
        };

        this.arrangeBody();
        this.bindResize();
        this.resize();
    }

    arrangeBody() {
        document.body.style.margin = 0;
        document.body.style.padding = 0;
    }

    resize() {
        const width  = glob.innerWidth;
        const height = glob.innerHeight - (this.gamedebugger.init ? 200 : 0);

        this.canvas.width  = width;
        this.canvas.height = height;       
        
        this.width  = width;
        this.height = height;

        this.graphics.resize(width, height);
        log("Game", `Handled resized at ${width} x ${height}`);
    }

    bindResize() {
        glob.addEventListener('resize', () => this.resize());
    }

    start() {
        log("Game", "Starting engine");
        this.frameRequest = requestAnimationFrame((time) => {this.draw(time)});
        return this;
    }

    update() {
        this.graphics.clear();
        this.graphics.draw();
        this.gamedebugger.ping();
        return this;
    }

    draw(time) {
        let delta = this.timing.ctime - time;
        if (delta < this.timing.framerate) {
            this.timing.ctime = time;
            this.timing.frame++;

            this.update();
        }

        this.frameRequest = requestAnimationFrame((time) => {this.draw(time)});
        return this;
    }
}

glob.SideQuest = { Game, SpriteSet, Sprite, GraphicElement, Physics, Keyboard, Mouse, log }
