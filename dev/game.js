const glob = require('./lib/glob');
const log = require('./lib/log');
const Debugger = require('./lib/debugger');
const Mouse = require('./lib/mouse');
const Graphics = require('./lib/graphics');

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

        this.graphics = new Graphics(this.context, this.options);
        this.mouse = new Mouse(this.canvas);

        this.gamedebugger = new Debugger(this.canvas);
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
        this.canvas.width  = glob.innerWidth;
        this.canvas.height = glob.innerHeight;
        this.graphics.resize(glob.innerWidth, glob.innerHeight);

        log("Game", `Handled resized at ${glob.innerWidth} x ${glob.innerHeight}`);
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

glob.SideQuest = {
    Game,
    GraphicElement : require('./lib/gelement'),
    Physics : require('./lib/physics')
}
