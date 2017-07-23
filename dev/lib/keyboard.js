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

const keystate = {};
for (let key in keymap) {
    keystate[key] = false;
}

class Keyboard {
    static get KEY_UP() { return keymap.up; }
    static get KEY_DOWN() { return keymap.down; }
    static get KEY_LEFT() { return keymap.left; }
    static get KEY_RIGHT() { return keymap.right; }
    static get KEY_SPACE() { return keymap.space; }
    static get KEY_SHIFT() { return keymap.shift; }
    static get KEY_ENTER() { return keymap.enter; }

    constructor(canvas) {
        this.canvas = canvas;

        log('Keyboard', "Binding global key events");
        this.keyEvents = {
            13 : [],
            16 : [],
            32 : [],
            37 : [],
            38 : [],
            39 : [],
            40 : []
        };

        this.upEvents = [];

        glob.addEventListener('keydown', (ev) => { this.down(ev); }); 
        glob.addEventListener('keyup',   (ev) => { this.up(ev);   }); 
    }

    addKey(byte, name) {
        this.keyEvents[byte] = name;
        keymap[name] = byte;
        keystate[byte] = false;

        log('Keyboard', 'Registered new key ' + name + ' with byte ' + byte);
    }

    down(ev) {
        if (this.keyEvents[ev.which] && !keystate[ev.which]) {
            keystate[ev.which] = true;
            this.keyEvents[ev.which].forEach(cb => cb(ev.which, true));
        }
    }

    keyToCode(key) {
        return keymap[key];
    }

    up(ev) {
        if (this.keyEvents[ev.which] && keystate[ev.which]) {
            keystate[ev.which] = false;
            this.keyEvents[ev.which].forEach(cb => cb(ev.which, false));
        }
    }

    bindKey(key, bind, sender) {
        log('Keyboard', "Bound key with id " + key);
        this.keyEvents[keymap[key] || key].push(sender ? bind.bind(sender) : bind);
    }

    killKey(key, bound) {
        let events = this.keyEvents[keymap[key] || key];
        let index = events.indexOf(x => x == bound);

        if (index != -1) {
            events.splice(index, 1);
        }
    }
}

module.exports = Keyboard;
