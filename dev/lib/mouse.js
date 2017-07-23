const log = require('./log');
const Physics = require('./physics');

class GameMouse {
    constructor(canvas) {
        this.canvas = canvas;
        this.bindBasicEvents();

        this.vector;
        this.bound = {
            mousedown : [],
            mouseup : []
        };
    }

    bindBasicEvents() {
        this.canvas.addEventListener('mousedown', (event) => {
            let button = event.which == 1 ? "left" : event.which == 3 ? "right" : "other";
            this.vector = new Physics.Vector2D(event.x, event.y);
            log("Mouse", `Mouse down at ${event.x} x ${event.y}, using ${button} button`);

            this.bound.mousedown.forEach(x => x());
        });

        this.canvas.addEventListener('mouseup', (event) => {
            this.vector.to(event.x, event.y);
            log("Mouse", `Mouse released at ${event.x} x ${event.y}, distance of ${this.vector.length()} px`);

            this.bound.mouseup.forEach(x => x());
        });
    }

    bind(eventname, cb, context) {
        this.bound[eventname].push(cb.bind(context));
    }

    directBind(eventname, cb, context) {
        this.canvas.addEventListener(eventname, cb.bind(context));
    }
}

module.exports = GameMouse;
