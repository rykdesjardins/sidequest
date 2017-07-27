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

},{"./lib/debugger":3,"./lib/gelement":5,"./lib/glob":6,"./lib/graphics":7,"./lib/keyboard":8,"./lib/log":9,"./lib/mouse":10,"./lib/physics":11,"./lib/sprite":12,"./lib/spriteset":13}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var Physics = require('./physics');

var Camera = function () {
    function Camera(w, h) {
        _classCallCheck(this, Camera);

        this.rect = new Physics.Rect(0, 0, w, h);
        this.following;
        this.locked = false;
    }

    _createClass(Camera, [{
        key: 'lock',
        value: function lock() {
            this.locked = true;
        }
    }, {
        key: 'unlock',
        value: function unlock() {
            this.locked = false;
        }
    }, {
        key: 'follow',
        value: function follow(gelement) {
            this.following = gelement;
        }
    }, {
        key: 'resize',
        value: function resize(w, h) {
            this.rect.w = w;
            this.rect.h = h;
        }
    }, {
        key: 'updateFromBound',
        value: function updateFromBound() {
            var half = this.rect.w / 2;
            var realx = this.following.vector.x - this.rect.x;

            if (realx > half + this.following.rect.x) {
                this.rect.x += realx - this.following.rect.x - half;
            } else if (realx + this.following.rect.x < half) {
                this.rect.x -= half - (realx + this.following.rect.x);
            }

            if (this.rect.x < 0) {
                this.rect.x = 0;
            }
        }
    }, {
        key: 'update',
        value: function update() {
            this.following && this.updateFromBound();
        }
    }]);

    return Camera;
}();

module.exports = Camera;

},{"./log":9,"./physics":11}],3:[function(require,module,exports){
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

},{"./dom":4,"./glob":6,"./log":9}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var d = require('./dom');
var Physics = require('./physics');
var Keyboard = require('./keyboard');
var Sprite = require('./sprite');
var SpriteSet = require('./spriteset');

var defaultoptions = function defaultoptions() {
    return {
        x: 0, y: 0, w: 0, h: 0,
        initspeed: 1,
        maxspeed: 3,
        gravity: 0,
        strength: 500,
        jumpheight: 0,
        controlled: false,
        useimagesize: false,
        friction: 0.2,
        override: {}
    };
};

var defaulteffects = function defaulteffects() {
    return { opacity: 1.0 };
};

var GraphicElement = function () {
    function GraphicElement(game, type) {
        var extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, GraphicElement);

        this.game = game;
        this.type = type;
        this.options = Object.assign(defaultoptions(), extra);
        this.vector = new Physics.Vector2D(this.options.x, this.options.y);
        this.rect = new Physics.Vector2D(this.options.w, this.options.h);
        this.collision = this.options.collision || new Physics.Rect(0, 0, this.rect.x, this.rect.y);
        this.strength = this.options.strength;
        this.effects = Object.assign(defaulteffects(), {});
        this.sticked = false;

        this.vector.setMaxVelocity(this.options.maxspeed, this.options.maxgravity);

        this.controlled = this.options.controlled;
        this.options.gravity && this.applyGravity(this.options.gravity);

        switch (this.type) {
            case "image":
                this.initImage();
                break;

            case "sprite":
                this.initSprite();
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
        value: function initSprite() {
            this.sprite = this.options.sprite;
        }
    }, {
        key: 'initImage',
        value: function initImage() {
            this.url = this.options.url;

            this.sprite = new Sprite({
                spritesets: {
                    neutral: new SpriteSet('file', this.url)
                },
                useimagesize: this.options.useimagesize
            });

            log('GElement', "Initialized Graphic Element with image at " + this.url);
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
            return this.sticked;
        }
    }, {
        key: 'update',
        value: function update() {
            this.vector.update();

            if (this.options.gravity && this.vector.y + this.rect.y > this.game.height) {
                this.vector.y = this.game.height - this.rect.y;
                this.vector.vely = 0;
                this.sticked = true;
            }

            return this;
        }
    }, {
        key: 'updateState',
        value: function updateState() {
            if (this.vector.vely < 0) {
                this.sprite.changeState('jumping');
                this.sticked = false;
            } else if (this.vector.vely > 0) {
                this.sticked = false;
                this.sprite.changeState('falling');
            } else if (this.vector.velx != 0) {
                this.sprite.changeState('running');
            } else {
                this.sprite.changeState('neutral');
            }
        }
    }, {
        key: 'shouldBeDrawn',
        value: function shouldBeDrawn(camera) {
            return this.vector.x - camera.rect.x + this.rect.x > 0 && this.vector.x - camera.rect.x < camera.rect.w && this.vector.y - camera.rect.y + this.rect.y > 0 && this.vector.y - camera.rect.y < camera.rect.h;
        }
    }, {
        key: 'collide',
        value: function collide(context, gelement) {
            if (this.strength <= gelement.strength) {
                var A = this.collisionPoints;
                var B = gelement.collisionPoints;
                var C = [A[0][0] - B[2][0], A[0][1] - B[2][1], A[1][0] - B[3][0], A[1][1] - B[3][1], A[2][0] - B[0][0], A[2][1] - B[0][1], A[3][0] - B[1][0], A[3][1] - B[1][1]];

                var smallindex = 0;
                var smallest = C[smallindex];
                for (var i = 1; i < C.length; i++) {
                    if (Math.abs(C[i]) < smallest) {
                        smallindex = i;
                        smallest = Math.abs(C[i]);
                    }
                }

                // x or y
                if (smallindex % 2 == 0) {
                    this.vector.velx = 0;
                    this.vector.accelx = 0;
                    this.vector.x -= C[smallindex];
                } else {
                    if (this.vector.vely > 0) {
                        this.sticked = true;
                    }

                    this.vector.vely = 0;
                    this.vector.y -= C[smallindex];
                }
            }
        }
    }, {
        key: 'collisionBox',
        value: function collisionBox(camera) {
            return new Physics.Rect(this.vector.x - camera.rect.x + this.collision.x, this.vector.y - camera.rect.y + this.collision.y, this.collision.w, this.collision.h);
        }
    }, {
        key: 'debug',
        value: function debug(context, camera, drawn) {
            var pos = { x: this.vector.x - camera.rect.x, y: this.vector.y - camera.rect.y, w: this.rect.x, h: this.rect.y };

            if (drawn) {
                context.beginPath();
                context.rect(this.collision.x + pos.x, this.collision.y + pos.y, this.collision.w || pos.w, this.collision.h || pos.h);
                context.lineWidth = 1;
                context.strokeStyle = 'red';
                context.stroke();

                context.beginPath();
                context.rect(pos.x, pos.y, pos.w, pos.h);
                context.lineWidth = 1;
                context.strokeStyle = 'blue';
                context.stroke();
            }

            context.font = "12px Arial, sans-serif";
            context.fillStyle = "black";
            context.fillText("Relative " + this.vector.x + " x " + this.vector.y, pos.x + pos.w + 5, pos.y + 10);
            context.fillText("Real " + (this.vector.x - camera.rect.x) + " x " + (this.vector.y - camera.rect.y), pos.x + pos.w + 5, pos.y + 24);
            context.fillText("State : " + this.sprite.state, pos.x + pos.w + 5, pos.y + 38);
            context.fillText("Velocity " + this.vector.velx + " x " + this.vector.vely, pos.x + pos.w + 5, pos.y + 52);
            context.fillText("Acceleration " + this.vector.accelx + " x " + this.vector.accely, pos.x + pos.w + 5, pos.y + 66);
            context.fillText("Drawn : " + (drawn ? "Yes" : "No") + ", strength : " + this.strength, pos.x + pos.w + 5, pos.y + 80);
        }
    }, {
        key: 'draw',
        value: function draw(context, camera) {
            var drawn = false;
            if (this.shouldBeDrawn(camera)) {
                var pos = this.sprite.draw(context, this.vector.x - camera.rect.x, this.vector.y - camera.rect.y, this.rect.x, this.rect.y);
                drawn = !!pos;
                if (this.options.useimagesize && pos) {
                    this.rect.x = pos.w;
                    this.rect.y = pos.h;
                }
            }

            if (this.game.options.env == "dev") {
                this.debug(context, camera, drawn);
            }

            return drawn;
        }
    }, {
        key: 'override',
        value: function override(action, callback) {
            this.override[action] = callback;
        }
    }, {
        key: 'jump',
        value: function jump() {
            if (this.isOnFloor()) {
                this.sticked = false;
                if (this.override.jump) {
                    this.override.jump();
                } else {
                    this.vector.vely = -this.options.jumpheight;
                }
            }
        }
    }, {
        key: 'keyCommand',
        value: function keyCommand(which, pressed, fromUp) {
            if (pressed) {
                switch (which) {
                    case Keyboard.KEY_RIGHT:
                        // this.vector.setVelocity(this.options.initspeed, this.vector.vely);
                        this.direction = "right";
                        this.keydown = true;
                        this.vector.setAcceleration(this.options.friction, this.vector.accely);
                        this.sprite.changeState(this.sprite.state, "right");
                        break;

                    case Keyboard.KEY_LEFT:
                        // this.vector.setVelocity(-this.options.initspeed, this.vector.vely);
                        this.direction = "left";
                        this.keydown = true;
                        this.vector.setAcceleration(-this.options.friction, this.vector.accely);
                        this.sprite.changeState(this.sprite.state, "left");
                        break;

                    case Keyboard.KEY_SPACE:
                    case Keyboard.KEY_UP:
                        this.jump();
                        break;

                    default:
                }
            } else if (this.keydown && (which == Keyboard.KEY_LEFT || which == Keyboard.KEY_RIGHT)) {
                this.keydown = false;
                var mod = this.direction == "left" ? 1 : -1;

                if (mod == -1 && this.vector.velx > 0 || mod == 1 && this.vector.velx < 0) {
                    this.vector.setAcceleration(this.options.friction * mod, this.vector.accely, true);
                } else {
                    this.vector.setAcceleration(this.options.friction * -mod, this.vector.accely, true);
                }

                this.sprite.changeState();
            }
        }
    }, {
        key: 'control',
        value: function control(keyboard) {
            var _this = this;

            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            this.controlled = true;
            this.keyboard = keyboard;

            log('GElement', "Binding Graphic Element with keyboard controls");
            if (options.arrows) {
                this.keventleft = function (which, pressed, fromup) {
                    return _this.keyCommand(which, pressed, fromup);
                };
                this.keventright = function (which, pressed, fromup) {
                    return _this.keyCommand(which, pressed, fromup);
                };
                this.keventup = function (which, pressed, fromup) {
                    return _this.keyCommand(which, pressed, fromup);
                };
                this.keventspace = function (which, pressed, fromup) {
                    return _this.keyCommand(which, pressed, fromup);
                };

                keyboard.bindKey('left', this.keventleft);
                keyboard.bindKey('right', this.keventright);
                keyboard.bindKey('up', this.keventup);
                keyboard.bindKey('space', this.keventspace);
            }
        }
    }, {
        key: 'giveupControll',
        value: function giveupControll() {
            keyboard.killKey('left', this.keventleft);
            keyboard.killKey('right', this.keventright);
            keyboard.killKey('up', this.keventup);
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
    }, {
        key: 'ready',
        get: function get() {
            return this.sprite.currentState.ready;
        }
    }, {
        key: 'collisionPoints',
        get: function get() {
            return [[this.vector.x + this.collision.x + this.collision.w, this.vector.y + this.collision.y], [this.vector.x + this.collision.x, this.vector.y + this.collision.y], [this.vector.x + this.collision.x, this.vector.y + this.collision.y + this.collision.h], [this.vector.x + this.collision.x + this.collision.w, this.vector.y + this.collision.y + this.collision.h]];
        }
    }]);

    return GraphicElement;
}();

module.exports = GraphicElement;

},{"./dom":4,"./keyboard":8,"./log":9,"./physics":11,"./sprite":12,"./spriteset":13}],6:[function(require,module,exports){
(function (global){
"use strict";

var __SIDESCROLLGAME = {
    env: "dev"
};

var glob = typeof "window" === "undefined" ? global : window;
glob.__SIDESCROLLGAME = __SIDESCROLLGAME;

module.exports = glob;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var Camera = require('./camera');
var Physics = require('./physics');

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

            return this;
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.graphicselements.forEach(function (x) {
                return x.destroy();
            });
            this.graphicselements = [];
            this._assocGE = {};

            return this;
        }
    }, {
        key: 'impactCheck',
        value: function impactCheck(context, camera) {
            for (var i = 0; i < this.graphicselements.length; i++) {
                for (var j = i + 1; j < this.graphicselements.length; j++) {
                    if (Physics.Collider.rectangles(this.graphicselements[i].collisionBox(camera), this.graphicselements[j].collisionBox(camera))) {
                        this.graphicselements[i].collide(context, this.graphicselements[j]);
                        this.graphicselements[j].collide(context, this.graphicselements[i]);
                    }
                }
            }
            return this;
        }
    }, {
        key: 'updateStates',
        value: function updateStates() {
            this.graphicselements.forEach(function (x) {
                return x.updateState();
            });
            return this;
        }
    }, {
        key: 'update',
        value: function update() {
            this.graphicselements.forEach(function (x) {
                return x.update();
            });
            return this;
        }
    }, {
        key: 'draw',
        value: function draw(context, camera) {
            this.graphicselements.forEach(function (x) {
                return x.draw(context, camera);
            });
            return this;
        }
    }]);

    return GraphicLayer;
}();

var Graphics = function () {
    function Graphics(context, options) {
        _classCallCheck(this, Graphics);

        this.context = this.c = context;
        this.options = options;
        this.camera = new Camera(context.width, context.height);

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
            this.camera.resize(this.w, this.h);
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
            element.id = elementid;
            this.layers[layerid].addElement(elementid, element);
        }
    }, {
        key: 'draw',
        value: function draw() {
            var _this = this;

            this.camera.update();
            this.layers.forEach(function (x) {
                return x.update().impactCheck(_this.context, _this.camera).updateStates().draw(_this.context, _this.camera);
            });
        }
    }]);

    return Graphics;
}();

module.exports = Graphics;

},{"./camera":2,"./log":9,"./physics":11}],8:[function(require,module,exports){
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
            var _this2 = this;

            if (this.keyEvents[ev.which] && keystate[ev.which]) {
                keystate[ev.which] = false;
                this.keyEvents[ev.which].forEach(function (cb) {
                    return cb(ev.which, false);
                });

                var _loop = function _loop(_key) {
                    var byte = keymap[_key];
                    keystate[byte] && _this2.keyEvents[byte] && _this2.keyEvents[byte].forEach(function (cb) {
                        return cb(byte, true, true);
                    });
                };

                for (var _key in keymap) {
                    _loop(_key);
                }
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

},{"./glob":6,"./log":9}],9:[function(require,module,exports){
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

},{"./glob.js":6}],10:[function(require,module,exports){
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

},{"./log":9,"./physics":11}],11:[function(require,module,exports){
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
        key: "add",
        value: function add(vector) {
            return new Vector2D(this.x + vector.x, this.y + vector.y);
        }
    }, {
        key: "sub",
        value: function sub(vector) {
            return new Vector2D(this.x - vector.x, this.y - vector.y);
        }
    }, {
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

            if (this.breakatzerox && (ogvelx > 0 && this.velx <= 0 || ogvelx < 0 && this.velx >= 0)) {
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

var Rect = function () {
    function Rect(x, y, w, h) {
        _classCallCheck(this, Rect);

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    _createClass(Rect, [{
        key: "points",
        get: function get() {
            return [[this.x, this.y + this.h], [this.x, this.y], [this.x + this.w, this.y], [this.x + this.w, this.y + this.h]];
        }
    }], [{
        key: "fromVectors2D",
        value: function fromVectors2D(a, b) {
            return new Rect(a.x, a.y, b.x, b.y);
        }
    }, {
        key: "Points",
        value: function Points(x, y, w, h) {
            return new Rect(x, y, w, h).points;
        }
    }]);

    return Rect;
}();

var Collider = function () {
    function Collider() {
        _classCallCheck(this, Collider);
    }

    _createClass(Collider, null, [{
        key: "rectangles",
        value: function rectangles(a, b) {
            return !(a.y + a.h < b.y || a.y > b.y + b.h || a.x + a.w < b.x || a.x > b.x + b.w);
        }
    }, {
        key: "vectors",
        value: function vectors(a, b) {}
    }, {
        key: "vect2rect",
        value: function vect2rect(rect, vector) {}
    }]);

    return Collider;
}();

module.exports = { Vector2D: Vector2D, Rect: Rect, Collider: Collider };

},{}],12:[function(require,module,exports){
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
            var ogstate = this.state;
            this.state = statename || this.initialstate;
            this.facing = facing || this.facing;

            if (!this.currentState) {
                this.spritesets[this.state] = this.spritesets["neutral"];
            }

            if (ogstate != this.state) {
                this.currentState.resetFrame();
            }
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
            var pos = void 0;
            if (this.facing == "right") {
                if (this.useimagesize) {
                    pos = this.currentState.draw(context, x, y);
                } else {
                    pos = this.currentState.draw(context, x, y, w, h);
                }
            } else if (this.facing == "left") {
                context.scale(-1, 1);
                if (this.useimagesize) {
                    pos = this.currentState.draw(context, -x - w, y);
                } else {
                    pos = this.currentState.draw(context, -x - w, y, w, h);
                }
                pos.x = x;
            }
            context.restore();

            return pos;
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

},{"./log":9,"./physics":11}],13:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var Physics = require('./physics');

var SpriteState = function SpriteState(bitmap, index) {
    _classCallCheck(this, SpriteState);

    this.bitmap = bitmap;
    this.index = index;
};

var SpriteSet = function () {
    function SpriteSet(type, urlscheme, totalstates, framestateupdate, noloop) {
        _classCallCheck(this, SpriteSet);

        this.type = type;
        this.url = urlscheme;
        this.frame = 0;
        this.framestateupdate = framestateupdate || false;
        this.drew = 0;
        this.ready = false;
        this.totalstates = totalstates || 1;
        this.noloop = noloop;
        this.states = [];

        log('SpriteSet', 'Creating new Sprite Set from ' + this.url + ' with ' + this.totalstates + ' states');
        if (type === "singleimage") {
            // TODO : Handle multiple states in single image
        } else if (type === "file") {
            this.load();
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
        key: 'resetFrame',
        value: function resetFrame() {
            this.frame = 0;
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
                this.frame = this.noloop ? this.frame - 1 : 0;
            }
        }
    }, {
        key: 'load',
        value: function load(done) {
            var _this = this;

            if (this.type == "singleimage") {
                // TODO : Handle loading states from one image
            } else {
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
            if (!this.ready) {
                return;
            }

            x = x || 0;
            y = y || 0;
            w = w || this.currentFrame.width;
            h = h || this.currentFrame.height;
            context.drawImage(this.currentFrame, x, y, w, h);
            this.drew++;
            if (this.framestateupdate && this.drew == this.framestateupdate) {
                this.drew = 0;
                this.nextFrame();
            }

            return new Physics.Rect(x, y, w, h);
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

},{"./log":9,"./physics":11}]},{},[1]);
