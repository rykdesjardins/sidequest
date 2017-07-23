(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var glob = require('./lib/glob');
var log = require('./lib/log');
var Debugger = require('./lib/debugger');
var Mouse = require('./lib/mouse');
var Graphics = require('./lib/graphics');
var SpriteSet = require('./lib/spriteset');
var Sprite = require('./lib/sprite');
var GraphicElement = require('./lib/gelement');
var Physics = require('./lib/physics');
var Keyboard = require('./lib/keyboard');

var Game = function () {
    _createClass(Game, null, [{
        key: 'defaults',
        value: function defaults() {
            return {
                bgcolor: "#eaeff2",
                fps: 60,
                layers: 5,
                env: "prod"
            };
        }

        // Argument is either an element ID, or an element

    }]);

    function Game(domid) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Game);

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
            delta: 0,
            ctime: 0,
            frame: 0,
            framerate: 1000 / this.options.fps
        };

        this.arrangeBody();
        this.bindResize();
        this.resize();
    }

    _createClass(Game, [{
        key: 'arrangeBody',
        value: function arrangeBody() {
            document.body.style.margin = 0;
            document.body.style.padding = 0;
        }
    }, {
        key: 'resize',
        value: function resize() {
            var width = glob.innerWidth;
            var height = glob.innerHeight - (this.gamedebugger.init ? 200 : 0);

            this.canvas.width = width;
            this.canvas.height = height;

            this.width = width;
            this.height = height;

            this.graphics.resize(width, height);
            log("Game", 'Handled resized at ' + width + ' x ' + height);
        }
    }, {
        key: 'bindResize',
        value: function bindResize() {
            var _this = this;

            glob.addEventListener('resize', function () {
                return _this.resize();
            });
        }
    }, {
        key: 'start',
        value: function start() {
            var _this2 = this;

            log("Game", "Starting engine");
            this.frameRequest = requestAnimationFrame(function (time) {
                _this2.draw(time);
            });
            return this;
        }
    }, {
        key: 'update',
        value: function update() {
            this.graphics.clear();
            this.graphics.draw();
            this.gamedebugger.ping();
            return this;
        }
    }, {
        key: 'draw',
        value: function draw(time) {
            var _this3 = this;

            var delta = this.timing.ctime - time;
            if (delta < this.timing.framerate) {
                this.timing.ctime = time;
                this.timing.frame++;

                this.update();
            }

            this.frameRequest = requestAnimationFrame(function (time) {
                _this3.draw(time);
            });
            return this;
        }
    }]);

    return Game;
}();

glob.SideQuest = { Game: Game, SpriteSet: SpriteSet, Sprite: Sprite, GraphicElement: GraphicElement, Physics: Physics, Keyboard: Keyboard, Mouse: Mouse, log: log };

},{"./lib/debugger":2,"./lib/gelement":4,"./lib/glob":5,"./lib/graphics":6,"./lib/keyboard":7,"./lib/log":8,"./lib/mouse":9,"./lib/physics":10,"./lib/sprite":11,"./lib/spriteset":12}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var d = require('./dom');
var glob = require('./glob');

var GameDebugger = function () {
    function GameDebugger(canvas) {
        _classCallCheck(this, GameDebugger);

        this.pingcount = 0;
        this.init = false;
        this.canvas = canvas;
    }

    _createClass(GameDebugger, [{
        key: 'createElem',
        value: function createElem() {
            this.elem = d.create({
                node: "div", id: "gamedebugger", parent: document.body, children: [{ node: "div", id: "debugframecount" }, { node: "div", id: "debugfps" }]
            });

            this.outputelem = d.create({
                node: "div", id: "debugoutput", parent: this.elem
            });

            this.init = true;
        }
    }, {
        key: 'bindError',
        value: function bindError() {
            var _this = this;

            glob.onerror = function (a, b, c, d, e) {
                return _this.error(a, b, c, d, e);
            };
        }
    }, {
        key: 'addStylesheet',
        value: function addStylesheet() {
            d.create({ node: "link", attr: { rel: "stylesheet", href: "/debug.css" }, parent: document.head });
        }
    }, {
        key: 'report',
        value: function report(eventtype, data) {}
    }, {
        key: 'ping',
        value: function ping() {
            this.pingcount++;
            if (this.init) {
                d.byID('debugframecount').textContent = this.pingcount + " frames";
            }
        }
    }, {
        key: 'startFPS',
        value: function startFPS() {
            var _this2 = this;

            this.lastpingat = 0;
            var fpsinterval = function fpsinterval() {
                d.byID('debugfps').textContent = _this2.pingcount - _this2.lastpingat + " FPS";
                _this2.lastpingat = _this2.pingcount;

                setTimeout(fpsinterval, 1000);
            };

            setTimeout(fpsinterval, 1000);
        }
    }, {
        key: 'log',
        value: function log(sender, str) {
            d.create({ node: "div", text: '[' + new Date().toLocaleTimeString() + ' - ' + sender + '] - ' + str, parent: this.outputelem });
            this.elem.scrollTop = this.outputelem.scrollHeight;
        }
    }, {
        key: 'bindCanvasEvents',
        value: function bindCanvasEvents() {}
    }, {
        key: 'cast',
        value: function cast() {
            var _this3 = this;

            this.createElem();
            this.addStylesheet();
            this.bindError();
            this.bindCanvasEvents();
            this.startFPS();
            log.listen(function (sender, str) {
                return _this3.log(sender, str);
            });

            log('Debugger', "Created debugger");
            this.elem.classList.add("shown");
        }
    }, {
        key: 'error',
        value: function error(msg, url, lineNo, columnNo, _error) {
            d.create({ node: "div", text: msg, attr: { style: "color : red;" }, parent: this.outputelem });
            d.create({ node: "pre", html: _error && _error.stack, attr: { style: "color : red;" }, parent: this.outputelem });
        }
    }]);

    return GameDebugger;
}();

module.exports = GameDebugger;

},{"./dom":3,"./glob":5,"./log":8}],3:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DOMHelper = function () {
    function DOMHelper() {
        _classCallCheck(this, DOMHelper);
    }

    _createClass(DOMHelper, [{
        key: "create",
        value: function create(op) {
            if (op.node == "text") {
                return document.createTextNode(op.text);
            }

            var node = document.createElement(op.node);
            if (op.id) {
                node.id = op.id;
            }

            node.className = op.className || op.classList && op.classList.join(' ') || "";

            if (op.attr) {
                var attr = Object.keys(op.attr);
                for (var i = 0; i < attr.length; i++) {
                    node.setAttribute(attr[i], op.attr[attr[i]]);
                }
            }

            if (op.text) {
                node.textContent = op.text;
            } else if (op.html) {
                node.innerHTML = op.html;
            }

            if (op.children) for (var i = 0; i < op.children.length; i++) {
                node.appendChild(this.create(op.children[i]));
            }

            if (op.parent) {
                op.parent.appendChild(node);
            }

            return node;
        }
    }, {
        key: "byID",
        value: function byID(id) {
            return document.getElementById(id);
        }
    }, {
        key: "query",
        value: function query(q, all) {
            return document[all ? "querySelectorAll" : "querySelector"](q);
        }
    }]);

    return DOMHelper;
}();

module.exports = new DOMHelper();

},{}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var d = require('./dom');
var Physics = require('./physics');
var Keyboard = require('./keyboard');

var defaultoptions = {
    x: 0, y: 0, w: 0, h: 0,
    initspeed: 1,
    maxspeed: 3,
    gravity: 0,
    jumpheight: 0,
    controlled: false,
    friction: 0.2
};

var GraphicElement = function () {
    function GraphicElement(game, type, extra) {
        _classCallCheck(this, GraphicElement);

        this.game = game;
        this.ready = false;
        this.type = type;
        this.options = Object.assign(defaultoptions, extra || {});
        this.vector = new Physics.Vector2D(this.options.x, this.options.y);
        this.rect = new Physics.Vector2D(this.options.w, this.options.h);

        this.vector.setMaxVelocity(this.options.maxspeed, this.options.maxgravity);

        this.controlled = this.options.controlled;
        this.options.gravity && this.applyGravity(this.options.gravity);

        this.key;

        switch (this.type) {
            case "image":
                this.initImage(this.options.url);
                this.options.preload && this.preload();
                break;

            case "sprite":
                this.initSprite(this.options.sprite);
                break;

            // TODO : Handle vector shapes
            case "shape":
                this.initShape(extra);
                break;

            default:
                throw new Error("GElement was created without an invalid type : " + this.type);
        }

        log('GElement', "Created a new Graphic Element of type " + this.type);
    }

    _createClass(GraphicElement, [{
        key: 'setPosition',
        value: function setPosition(x, y) {
            this.vector.at(x, y);
        }
    }, {
        key: 'initSprite',
        value: function initSprite(sprite) {
            this.sprite = sprite;
            this.key = sprite;
            this.draw = this.drawSprite;
        }
    }, {
        key: 'initImage',
        value: function initImage(url) {
            this.url = url;
            this.image = new Image();
            this.key = this.image;
            this.draw = this.drawImage;
            log('GElement', "Initialized Graphic Element with image at " + this.url);
        }
    }, {
        key: 'preload',
        value: function preload() {
            var _this = this;

            this.image.onload = function () {
                createImageBitmap(_this.image).then(function (imgbitmap) {
                    _this.imagebitmap = imgbitmap;
                    if (!_this.rect.w && !_this.rect.h) {
                        _this.rect.at(_this.imagebitmap.width, _this.imagebitmap.height);
                    }

                    log('GElement', "Preloaded Graphic Element with image at " + _this.url);
                    _this.ready = true;
                    _this.options.preloadcallback && _this.options.preloadcallback(_this);
                });
            };

            this.image.src = this.url;
        }
    }, {
        key: 'applyGravity',
        value: function applyGravity(gravity) {
            this.vector.setAcceleration(this.vector.accelx, gravity);
        }
    }, {
        key: 'initShape',
        value: function initShape(info) {}
    }, {
        key: 'isOnFloor',
        value: function isOnFloor() {
            return this.vector.y >= this.game.height - this.rect.y;
        }
    }, {
        key: 'update',
        value: function update() {
            if (this.options.gravity) {
                if (this.isOnFloor()) {
                    this.vector.y = this.game.height - this.rect.y;
                    this.vector.vely = 0;
                }
            }
        }
    }, {
        key: 'drawImage',
        value: function drawImage(context) {
            this.vector.update();
            this.update();
            this.imagebitmap && context.drawImage(this.imagebitmap, this.vector.x, this.vector.y, this.rect.x, this.rect.y);
        }
    }, {
        key: 'drawSprite',
        value: function drawSprite(context) {
            this.vector.update();
            this.update();
            this.sprite.draw(context, this.vector.x, this.vector.y, this.rect.x, this.rect.y);
        }
    }, {
        key: 'drawShape',
        value: function drawShape(context) {}
    }, {
        key: 'draw',
        value: function draw(context) {
            throw new Error("Tried to draw a GElement with an invalid type : " + this.type);
        }
    }, {
        key: 'jump',
        value: function jump() {
            if (this.isOnFloor()) {
                if (this.sprite) {
                    this.sprite.changeState('jumping');
                }
                this.vector.vely = -this.options.jumpheight;
            }
        }
    }, {
        key: 'keyCommand',
        value: function keyCommand(which, pressed) {
            if (pressed) {
                switch (which) {
                    case Keyboard.KEY_RIGHT:
                        this.vector.setVelocity(this.options.initspeed, this.vector.vely);
                        this.direction = "right";
                        this.keydown = true;
                        this.vector.setAcceleration(this.options.friction, this.vector.accely);
                        if (this.sprite) {
                            this.sprite.changeState(this.movingstate, "right");
                        }
                        break;

                    case Keyboard.KEY_LEFT:
                        this.vector.setVelocity(-this.options.initspeed, this.vector.vely);
                        this.direction = "left";
                        this.keydown = true;
                        this.vector.setAcceleration(-this.options.friction, this.vector.accely);
                        if (this.sprite) {
                            this.sprite.changeState(this.movingstate, "left");
                        }
                        break;

                    case Keyboard.KEY_SPACE:
                        this.jump();
                        break;

                    default:
                }
            } else if (this.keydown && (which == Keyboard.KEY_LEFT || which == Keyboard.KEY_RIGHT)) {
                this.keydown = false;
                var mod = this.direction == "left" ? 1 : -1;
                this.vector.setAcceleration(this.options.friction * mod, this.vector.accely, true);

                if (this.sprite) {
                    this.sprite.changeState();
                }
            }
        }
    }, {
        key: 'control',
        value: function control(keyboard) {
            var _this2 = this;

            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            this.controlled = true;
            this.keyboard = keyboard;
            this.movingstate = options.movingstate || "running";

            log('GElement', "Binding Graphic Element with keyboard controls");
            if (options.arrows) {
                this.keventleft = function (which, pressed) {
                    return _this2.keyCommand(which, pressed);
                };
                this.keventright = function (which, pressed) {
                    return _this2.keyCommand(which, pressed);
                };
                this.keventspace = function (which, pressed) {
                    return _this2.keyCommand(which, pressed);
                };

                keyboard.bindKey('left', this.keventleft);
                keyboard.bindKey('right', this.keventright);
                keyboard.bindKey('space', this.keventspace);
            }
        }
    }, {
        key: 'giveupControll',
        value: function giveupControll() {
            keyboard.killKey('left', this.keventleft);
            keyboard.killKey('right', this.keventright);
            keyboard.killKey('space', this.keventspace);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            log('GElement', 'Destroyed Graphic Element of type ' + this.type);
            this.imagebitmap && this.imagebitmap.close();
            this.image && this.image.remove();
            if (this.controlled) {
                this.giveupControll();
            }
        }
    }]);

    return GraphicElement;
}();

module.exports = GraphicElement;

},{"./dom":3,"./keyboard":7,"./log":8,"./physics":10}],5:[function(require,module,exports){
(function (global){
"use strict";

var __SIDESCROLLGAME = {
    env: "dev"
};

var glob = typeof "window" === "undefined" ? global : window;
glob.__SIDESCROLLGAME = __SIDESCROLLGAME;

module.exports = glob;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');

var GraphicLayer = function () {
    function GraphicLayer(index) {
        _classCallCheck(this, GraphicLayer);

        this.index = index;

        this.graphicselements = [];
        this._assocGE = {};
    }

    _createClass(GraphicLayer, [{
        key: 'addElement',
        value: function addElement(id, gelement) {
            log('GraphicLayer', "Added an element to layer " + this.index + " with id " + id);
            this.graphicselements.push(gelement);
            this._assocGE[id] = gelement;
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.graphicselements.forEach(function (x) {
                return x.destroy();
            });
            this.graphicselements = [];
            this._assocGE = {};
        }
    }, {
        key: 'draw',
        value: function draw(context) {
            this.graphicselements.forEach(function (x) {
                return x.draw(context);
            });
        }
    }]);

    return GraphicLayer;
}();

var Graphics = function () {
    function Graphics(context, options) {
        _classCallCheck(this, Graphics);

        this.context = this.c = context;
        this.options = options;

        this.layers = [];
        this.fixedLayer = new GraphicLayer(-1);

        for (var i = 0; i < options.layers; i++) {
            this.layers.push(new GraphicLayer(i));
        }
    }

    _createClass(Graphics, [{
        key: 'resize',
        value: function resize(w, h) {
            this.w = w;
            this.h = h;
            this.rect = [0, 0, this.w, this.h];
        }
    }, {
        key: 'clear',
        value: function clear() {
            var _c;

            this.c.fillStyle = this.options.bgcolor;
            (_c = this.c).fillRect.apply(_c, _toConsumableArray(this.rect));
        }
    }, {
        key: 'addElement',
        value: function addElement(layerid, elementid, element) {
            this.layers[layerid].addElement(elementid, element);
        }
    }, {
        key: 'draw',
        value: function draw() {
            var _this = this;

            this.layers.forEach(function (x) {
                return x.draw(_this.context);
            });
        }
    }]);

    return Graphics;
}();

module.exports = Graphics;

},{"./log":8}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var glob = require('./glob');

var keymap = {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    space: 32,
    shift: 16,
    enter: 13
};

var keystate = {};
for (var key in keymap) {
    keystate[key] = false;
}

var Keyboard = function () {
    _createClass(Keyboard, null, [{
        key: 'KEY_UP',
        get: function get() {
            return keymap.up;
        }
    }, {
        key: 'KEY_DOWN',
        get: function get() {
            return keymap.down;
        }
    }, {
        key: 'KEY_LEFT',
        get: function get() {
            return keymap.left;
        }
    }, {
        key: 'KEY_RIGHT',
        get: function get() {
            return keymap.right;
        }
    }, {
        key: 'KEY_SPACE',
        get: function get() {
            return keymap.space;
        }
    }, {
        key: 'KEY_SHIFT',
        get: function get() {
            return keymap.shift;
        }
    }, {
        key: 'KEY_ENTER',
        get: function get() {
            return keymap.enter;
        }
    }]);

    function Keyboard(canvas) {
        var _this = this;

        _classCallCheck(this, Keyboard);

        this.canvas = canvas;

        log('Keyboard', "Binding global key events");
        this.keyEvents = {
            13: [],
            16: [],
            32: [],
            37: [],
            38: [],
            39: [],
            40: []
        };

        this.upEvents = [];

        glob.addEventListener('keydown', function (ev) {
            _this.down(ev);
        });
        glob.addEventListener('keyup', function (ev) {
            _this.up(ev);
        });
    }

    _createClass(Keyboard, [{
        key: 'addKey',
        value: function addKey(byte, name) {
            this.keyEvents[byte] = name;
            keymap[name] = byte;
            keystate[byte] = false;

            log('Keyboard', 'Registered new key ' + name + ' with byte ' + byte);
        }
    }, {
        key: 'down',
        value: function down(ev) {
            if (this.keyEvents[ev.which] && !keystate[ev.which]) {
                keystate[ev.which] = true;
                this.keyEvents[ev.which].forEach(function (cb) {
                    return cb(ev.which, true);
                });
            }
        }
    }, {
        key: 'keyToCode',
        value: function keyToCode(key) {
            return keymap[key];
        }
    }, {
        key: 'up',
        value: function up(ev) {
            if (this.keyEvents[ev.which] && keystate[ev.which]) {
                keystate[ev.which] = false;
                this.keyEvents[ev.which].forEach(function (cb) {
                    return cb(ev.which, false);
                });
            }
        }
    }, {
        key: 'bindKey',
        value: function bindKey(key, bind, sender) {
            log('Keyboard', "Bound key with id " + key);
            this.keyEvents[keymap[key] || key].push(sender ? bind.bind(sender) : bind);
        }
    }, {
        key: 'killKey',
        value: function killKey(key, bound) {
            var events = this.keyEvents[keymap[key] || key];
            var index = events.indexOf(function (x) {
                return x == bound;
            });

            if (index != -1) {
                events.splice(index, 1);
            }
        }
    }]);

    return Keyboard;
}();

module.exports = Keyboard;

},{"./glob":5,"./log":8}],8:[function(require,module,exports){
"use strict";

var glob = require('./glob.js');
var noOp = function noOp() {};
var event = void 0;

var log = function log(sender, str) {
    console.log("[" + new Date() + " - " + sender + "] " + str);
    event && event(sender, str);
};

log.listen = function (cb) {
    event = cb;
};

module.exports = glob.__SIDESCROLLGAME.env == "dev" ? log : noOp;

},{"./glob.js":5}],9:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var Physics = require('./physics');

var GameMouse = function () {
    function GameMouse(canvas) {
        _classCallCheck(this, GameMouse);

        this.canvas = canvas;
        this.bindBasicEvents();

        this.vector;
        this.bound = {
            mousedown: [],
            mouseup: []
        };
    }

    _createClass(GameMouse, [{
        key: 'bindBasicEvents',
        value: function bindBasicEvents() {
            var _this = this;

            this.canvas.addEventListener('mousedown', function (event) {
                var button = event.which == 1 ? "left" : event.which == 3 ? "right" : "other";
                _this.vector = new Physics.Vector2D(event.x, event.y);
                log("Mouse", 'Mouse down at ' + event.x + ' x ' + event.y + ', using ' + button + ' button');

                _this.bound.mousedown.forEach(function (x) {
                    return x();
                });
            });

            this.canvas.addEventListener('mouseup', function (event) {
                _this.vector.to(event.x, event.y);
                log("Mouse", 'Mouse released at ' + event.x + ' x ' + event.y + ', distance of ' + _this.vector.length() + ' px');

                _this.bound.mouseup.forEach(function (x) {
                    return x();
                });
            });
        }
    }, {
        key: 'bind',
        value: function bind(eventname, cb, context) {
            this.bound[eventname].push(cb.bind(context));
        }
    }, {
        key: 'directBind',
        value: function directBind(eventname, cb, context) {
            this.canvas.addEventListener(eventname, cb.bind(context));
        }
    }]);

    return GameMouse;
}();

module.exports = GameMouse;

},{"./log":8,"./physics":10}],10:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Vector2D = function () {
    function Vector2D(x, y, destx, desty) {
        _classCallCheck(this, Vector2D);

        this.x = x;
        this.y = y;

        this.destx = destx;
        this.desty = desty;

        this.velx = 0;
        this.vely = 0;

        this.accelx = 0;
        this.accely = 0;

        this.maxvelx;
        this.maxvely;
    }

    _createClass(Vector2D, [{
        key: "at",
        value: function at(x, y) {
            this.x = x;
            this.y = y;
        }
    }, {
        key: "to",
        value: function to(destx, desty) {
            this.destx = destx;
            this.desty = desty;
        }
    }, {
        key: "setMaxVelocity",
        value: function setMaxVelocity(x, y) {
            this.maxvelx = x;
            this.maxvely = y;
        }
    }, {
        key: "setVelocity",
        value: function setVelocity(x, y) {
            this.velx = x;
            this.vely = y;
        }
    }, {
        key: "setAcceleration",
        value: function setAcceleration(x, y, breakatzerox, breakatzeroy) {
            this.accelx = x;
            this.accely = y;

            this.breakatzerox = breakatzerox;
            this.breakatzeroy = breakatzeroy;
        }
    }, {
        key: "update",
        value: function update() {
            var ogvelx = this.velx;
            var ogvely = this.vely;

            this.velx += this.accelx;
            this.vely += this.accely;

            if (this.maxvelx && Math.abs(this.velx) > this.maxvelx) {
                this.velx = this.maxvelx * (this.velx < 0 ? -1 : 1);
            }
            if (this.maxvely && Math.abs(this.vely) > this.maxvely) {
                this.vely = this.maxvely * (this.vely < 0 ? -1 : 1);
            }

            if (this.breakatzerox && (ogvelx > 0 && this.velx < 0 || ogvelx < 0 && this.velx > 0)) {
                this.accelx = 0;
                this.velx = 0;
            }

            if (this.breakatzeroy && (ogvely > 0 && this.vely < 0 || ogvely < 0 && this.vely > 0)) {
                this.accely = 0;
                this.vely = 0;
            }

            this.x += this.velx;
            this.y += this.vely;
        }
    }, {
        key: "length",
        value: function length() {
            return Math.sqrt(Math.pow(this.x - this.destx, 2) + Math.pow(this.y - this.desty, 2));
        }
    }]);

    return Vector2D;
}();

module.exports = { Vector2D: Vector2D };

},{}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var Physics = require('./physics');

var Sprite = function () {
    function Sprite() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Sprite);

        this.options = options;
        this.state = options.state || "neutral";
        this.initialstate = this.state;
        this.spritesets = options.spritesets || {};
        this.facing = options.facing || "right";
    }

    _createClass(Sprite, [{
        key: 'addState',
        value: function addState(statename, spriteset) {
            this.spritesets[statename] = spriteset;
        }
    }, {
        key: 'changeState',
        value: function changeState(statename, facing) {
            this.state = statename || this.initialstate;
            this.facing = facing || this.facing;
        }
    }, {
        key: 'updateState',
        value: function updateState() {
            this.currentState.nextFrame();
        }
    }, {
        key: 'draw',
        value: function draw(context, x, y, w, h) {
            context.save();
            if (this.facing == "right") {
                this.currentState.draw(context, x, y, w, h);
            } else if (this.facing == "left") {
                context.scale(-1, 1);
                this.currentState.draw(context, -x - w, y, w, h);
            }
            context.restore();
        }
    }, {
        key: 'currentState',
        get: function get() {
            return this.spritesets[this.state];
        }
    }]);

    return Sprite;
}();

module.exports = Sprite;

},{"./log":8,"./physics":10}],12:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');

var SpriteState = function SpriteState(bitmap, index) {
    _classCallCheck(this, SpriteState);

    this.bitmap = bitmap;
    this.index = index;
};

var SpriteSet = function () {
    function SpriteSet(type, urlscheme, totalstates, framestateupdate) {
        _classCallCheck(this, SpriteSet);

        this.type = type;
        this.url = urlscheme;
        this.frame = 0;
        this.framestateupdate = framestateupdate || 10;
        this.drew = 0;
        this.ready = false;
        this.totalstates = totalstates;
        this.states = [];

        log('SpriteSet', 'Creating new Sprite Set from ' + urlscheme + ' with ' + totalstates + ' states');
        if (type === "singleimage") {
            // TODO : Handle multiple states in single image
        } else if (type === "fileset") {
            this.load();
        } else {
            throw new Error("Created a SpriteSet with an invalid type : " + type);
        }
    }

    _createClass(SpriteSet, [{
        key: 'getImageFromURL',
        value: function getImageFromURL(url, send) {
            var img = new Image();
            img.onload = function () {
                createImageBitmap(img).then(function (bitmap) {
                    send(bitmap);
                });
            };

            img.src = url;
        }
    }, {
        key: 'previousFrame',
        value: function previousFrame() {
            this.frame--;
            if (this.frame < 0) {
                this.frame = this.totalstates - 1;
            }
        }
    }, {
        key: 'nextFrame',
        value: function nextFrame() {
            this.frame++;
            if (this.frame == this.totalstates) {
                this.frame = 0;
            }
        }
    }, {
        key: 'load',
        value: function load(done) {
            var _this = this;

            if (this.type == "singleimage") {
                // TODO : Handle loading states from one image
            } else if (this.type == "fileset") {
                log('SpriteSet', 'Loading states from url scheme ' + this.url);
                var imageIndex = -1;
                var loadNextImage = function loadNextImage() {
                    if (++imageIndex == _this.totalstates) {
                        _this.ready = true;
                        log('SpriteSet', 'Done loading states for SpriteSet with url ' + _this.url);

                        return done && done();
                    }

                    _this.getImageFromURL(_this.url.replace('$', imageIndex + 1), function (bitmap) {
                        _this.states.push(bitmap);
                        loadNextImage();
                    });
                };

                loadNextImage();
            }
        }
    }, {
        key: 'draw',
        value: function draw(context, x, y, w, h) {
            this.ready && context.drawImage(this.currentFrame, x, y, w, h);
            this.drew++;
            if (this.drew == this.framestateupdate) {
                this.drew = 0;
                this.nextFrame();
            }
        }
    }, {
        key: 'destroy',
        value: function destroy() {}
    }, {
        key: 'currentFrame',
        get: function get() {
            return this.states[this.frame];
        }
    }]);

    return SpriteSet;
}();

module.exports = SpriteSet;

},{"./log":8}]},{},[1]);
