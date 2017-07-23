const log = require('./log');
const glob = require('./glob');

const keymap = {
    up : 38,
    down : 40, 
    left : 37,
    right : 39,
    space : 32,
    shift : 16,
    enter : 13
};

class Keyboard {
    constructor(canvas) {
        this.canvas = canvas;

        log('Keyboard', "Binding global key events");
        this.keyEvents = {
            /* up    */ 38 : [],
            /* down  */ 40 : [],
            /* left  */ 37 : [],
            /* right */ 39 : [],
            /* space */ 32 : [],
            /* shift */ 16 : [],
            /* enter */ 13 : []
        };

        this.upEvents = [];

        glob.addEventListener('keydown', (ev) => { this.down(ev); }); 
        glob.addEventListener('keyup',   (ev) => { this.up(ev);   }); 
    }

    down(ev) {
        if (this.keyEvents[ev.which]) {
            this.keyEvents[ev.which].forEach(ev => ev());
        }
    }

    up(ev) {
        this.upEvents.forEach(ev => ev());
    }

    bindKey(key, bind, sender) {
        log('Keyboard', "Bound key with id " + key);
        this.keyEvents[keymap[key] || key].push(sender ? bind.bind(sender) : bind);
    }

    bindKeyUp(bind, sender) {
        this.upEvents.push(sender ? bind.bind(sender) : bind);
    }

    killKey(key, bound) {
        let events = this.keyEvents[keymap[key] || key];
        let index = events.indexOf(x => x == bound);

        if (index != -1) {
            events.splice(index, 1);
        }
    }

    killKeyUp(bound) {
        let events = this.upEvents;
        let index = events.indexOf(x => x == bound);

        if (index != -1) {
            events.splice(index, 1);
        }
    }
}

module.exports = Keyboard;
