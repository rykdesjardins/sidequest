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
var World = require('./lib/world');
var Audio = require('./lib/audio');
var Loader = require('./lib/loader');

var Game = function () {
    _createClass(Game, null, [{
        key: 'defaults',
        value: function defaults() {
            return {
                bgcolor: "#eaeff2",
                fps: 60,
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

        this.loader = new Loader();
        this.mouse = new Mouse(this.canvas);
        this.keyboard = new Keyboard(this.canvas);
        this.audio = new Audio(this.options.audiochannels);
        this.world = new World(this, this.options.world);

        if (this.options.env === "dev") {
            this.dev = true;
            this.gamedebugger.cast();
        }

        this.timing = {
            delta: 0,
            ctime: 0,
            frame: 0,
            framerate: 1000 / this.options.fps
        };

        this.width = this.options.width || this.canvas.style.width || this.canvas.width || glob.innerWidth;
        this.height = this.options.height || this.canvas.style.height || this.canvas.height || glob.innerHeight;

        this.bindResize();
        this.resize();
    }

    _createClass(Game, [{
        key: 'resize',
        value: function resize() {
            var width = this.width;
            var height = this.height;

            this.canvas.width = width;
            this.canvas.height = height;

            this.world.resize(width, height);
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
            if (!this.world.hasStage()) {
                throw new Error("[Game] Cannot start game without a stage");
            }

            this.resize();
            this.frameRequest = requestAnimationFrame(function (time) {
                _this2.draw(time);
            });
            return this;
        }
    }, {
        key: 'update',
        value: function update() {
            this.gamedebugger.ping();
            this.world.update();
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
                this.world.draw();
            }

            this.frameRequest = requestAnimationFrame(function (time) {
                _this3.draw(time);
            });
            return this;
        }
    }, {
        key: 'loadFromRemote',
        value: function loadFromRemote(type, source, done) {
            switch (type) {
                case "stage":
                    this.loader.loadStage(source, this, done);break;

                case "world":
                    this.loader.loadWorld(source, this, done);break;
            }
        }

        // Shortcut

    }, {
        key: 'createStage',
        value: function createStage() {
            var _world;

            return (_world = this.world).createStage.apply(_world, arguments);
        }
    }]);

    return Game;
}();

glob.SideQuest = { Game: Game, SpriteSet: SpriteSet, Sprite: Sprite, GraphicElement: GraphicElement, Physics: Physics, Keyboard: Keyboard, Mouse: Mouse, World: World, Audio: Audio, log: log };

},{"./lib/audio":4,"./lib/debugger":6,"./lib/gelement":8,"./lib/glob":9,"./lib/graphics":10,"./lib/keyboard":11,"./lib/loader":12,"./lib/log":13,"./lib/mouse":14,"./lib/physics":16,"./lib/sprite":17,"./lib/spriteset":18,"./lib/world":19}],2:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Drawable = function () {
    function Drawable() {
        _classCallCheck(this, Drawable);

        this.hooks = {
            collide: []
        };

        this.state = "neutral";
        this.facing = "right";

        this.initialstate = this.state;
    }

    _createClass(Drawable, [{
        key: "draw",
        value: function draw(context, x, y, w, h, camera) {
            return { x: x, y: y, w: w, h: h };
        }
    }, {
        key: "on",
        value: function on(hookname, callback) {
            if (!this.hooks[hookname]) {
                this.hooks[hookname] = [];
            }

            this.hooks[hookname].push(callback);
        }
    }, {
        key: "collide",
        value: function collide(gelement, direction) {
            var _this = this;

            var defaultCollision = true;
            this.hooks.collide.forEach(function (callback) {
                if (!callback(_this, gelement, direction)) {
                    defaultCollision = false;
                }
            });

            return defaultCollision;
        }
    }, {
        key: "addState",
        value: function addState() {}
    }, {
        key: "changeState",
        value: function changeState() {}
    }, {
        key: "updateState",
        value: function updateState() {}
    }, {
        key: "destroy",
        value: function destroy() {}
    }, {
        key: "currentState",
        get: function get() {
            return this.state;
        }
    }, {
        key: "alwaysDraw",
        get: function get() {
            return false;
        }
    }]);

    return Drawable;
}();

module.exports = Drawable;

},{}],3:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Drawable = require('./abstract/drawable');
var Physics = require('./physics');

var Area = function (_Drawable) {
    _inherits(Area, _Drawable);

    function Area() {
        _classCallCheck(this, Area);

        return _possibleConstructorReturn(this, (Area.__proto__ || Object.getPrototypeOf(Area)).call(this));
    }

    return Area;
}(Drawable);

module.exports = Area;

},{"./abstract/drawable":2,"./physics":16}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var Loader = require('./loader');

var AUDIO_RAW = {};

var Sound = function () {
    function Sound() {
        _classCallCheck(this, Sound);

        this.ready = false;
    }

    _createClass(Sound, [{
        key: 'setBuffer',
        value: function setBuffer(buffer) {
            this.buffer = buffer;
            this.ready = true;
        }
    }]);

    return Sound;
}();

var AudioChannel = function () {
    function AudioChannel() {
        _classCallCheck(this, AudioChannel);

        this.context = new AudioContext();
        this.source;
    }

    _createClass(AudioChannel, [{
        key: 'play',
        value: function play(id) {
            var _this = this;

            var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var loop = arguments[2];

            this.context.decodeAudioData(AUDIO_RAW[id].buffer, function (data) {
                _this.source = _this.context.createBufferSource();
                _this.source.buffer = data;
                _this.source.connect(_this.context.destination);
                _this.source.loop = loop;
                _this.source.start(time);
            });
        }
    }, {
        key: 'stop',
        value: function stop() {
            this.source && this.source.stop();
        }
    }]);

    return AudioChannel;
}();

var Audio = function () {
    function Audio() {
        var totalchannel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;

        _classCallCheck(this, Audio);

        this.totalchannel = totalchannel;
        this.loader = new Loader();
        this.channels = [];

        for (var i = 0; i < this.totalchannel; i++) {
            this.channels.push(new AudioChannel());
        }
    }

    _createClass(Audio, [{
        key: 'load',
        value: function load(id, filename, done) {
            if (AUDIO_RAW[id]) {
                throw new Error('[Audio] Tried to register existing audio file with id ' + id);
            }

            AUDIO_RAW[id] = new Sound();
            this.loader.loadAudio(filename, AUDIO_RAW[id], done);

            return AUDIO_RAW[id];
        }
    }, {
        key: 'play',
        value: function play(id) {
            var channel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var _this2 = this;

            var time = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var loop = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

            log('Audio', 'Requested song with id ' + id + ' to be played');
            if (!AUDIO_RAW[id]) {
                throw new Error('[Audio] Tried to play undefined sound with id ' + id);
            }

            if (!AUDIO_RAW[id].ready) {
                log('Audio', 'Song with id ' + id + ' will play once it\'s loaded');
                AUDIO_RAW[id].onready = function () {
                    log('Audio', 'Song with id ' + id + ' will now play automatically');
                    _this2.channels[channel].play(id, time, loop);
                };
                return false;
            }

            this.channels[channel].play(id, time, loop);
        }
    }, {
        key: 'stop',
        value: function stop(channel) {
            this.channels[channel].stop();
        }
    }]);

    return Audio;
}();

module.exports = Audio;

},{"./loader":12,"./log":13}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var Physics = require('./physics');

var Camera = function () {
    function Camera(ox, oy, w, h, vmod) {
        _classCallCheck(this, Camera);

        this.rect = new Physics.Rect(0, 0, w, h);
        this.origin = new Physics.Vector2D(ox, oy);
        this.limits = new Physics.Vector2D(w, h);
        this.vmod = vmod;

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
        key: 'setLimits',
        value: function setLimits(vector) {
            this.limits = vector;
        }
    }, {
        key: 'updateFromBound',
        value: function updateFromBound() {
            var half = this.rect.w / 2;
            var halfy = this.rect.h / 2;
            var realx = this.following.vector.x - this.rect.x;
            var realy = this.following.vector.y - this.rect.y;

            if (realx > half + this.following.rect.x) {
                this.rect.x += realx - this.following.rect.x - half;
            } else if (realx + this.following.rect.x < half) {
                this.rect.x -= half - (realx + this.following.rect.x);
            }

            if (realy > halfy) {
                this.rect.y += realy - halfy;
            } else if (realy + this.following.rect.y < halfy) {
                this.rect.y -= halfy - (realy + this.following.rect.y);
            }

            if (this.rect.x < 0) {
                this.rect.x = 0;
            } else if (this.rect.x + this.rect.w > this.limits.x) {
                this.rect.x = this.limits.x - this.rect.w;
            }

            if (this.rect.y > 0) {
                this.rect.y = 0;
            } else if (this.rect.y - this.rect.h < -this.limits.y) {
                this.rect.y = -(this.limits.y - this.rect.h);
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

},{"./log":13,"./physics":16}],6:[function(require,module,exports){
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

},{"./dom":7,"./glob":9,"./log":13}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var d = require('./dom');
var Physics = require('./physics');
var Keyboard = require('./keyboard');
var Sprite = require('./sprite');
var SpriteSet = require('./spriteset');
var Area = require('./area');
var Pan = require('./pan');

var GraphicElementTemplates = {};

var CollisionMatrixDirections = ["right", "top", "left", "top", "left", "bottom", "right", "bottom"];

var GraphicElement = function () {
    _createClass(GraphicElement, null, [{
        key: 'defaultoptions',
        value: function defaultoptions() {
            return {
                x: 0, y: 0,
                w: 0, h: 0,
                useimagesize: false,

                initspeed: 1, maxspeed: 3, friction: 0.2,
                gravity: 0, maxgravity: 0, jumpheight: 0,

                strength: 500,
                controlled: false, fixedtostage: false,
                pattern: false, patternsize: undefined,
                through: false,

                override: {}
            };
        }
    }, {
        key: 'defaulteffects',
        value: function defaulteffects() {
            return {
                opacity: 1.0,
                composite: "source-over"
            };
        }
    }, {
        key: 'createTemplate',
        value: function createTemplate(id, type) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var effects = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
            var overwrite = arguments[4];

            if (!overwrite && GraphicElementTemplates[id]) {
                throw new Error('[GraphicElement] Template with id ' + id + ' already exists');
            }

            GraphicElementTemplates[id] = { type: type, options: options, effects: effects };
        }
    }, {
        key: 'fromTemplate',
        value: function fromTemplate(game, id) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            var effects = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

            var template = GraphicElementTemplates[id];
            if (!template) {
                throw new Error('[GraphicElement] Tried to initialize with undefined template : ' + id);
            }

            return new GraphicElement(game, template.type, Object.assign(template.options, options), Object.assign(template.effects, effects));
        }
    }]);

    function GraphicElement(game, type) {
        var extra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var effects = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        _classCallCheck(this, GraphicElement);

        this.game = game;
        this.type = type;
        this.options = Object.assign(GraphicElement.defaultoptions(), extra);
        this.vector = new Physics.Vector2D(this.options.x, this.options.y);
        this.rect = new Physics.Vector2D(this.options.w, this.options.h);
        this.collision = this.options.collision || new Physics.Rect(0, 0, this.rect.x, this.rect.y);
        this.strength = this.options.strength;
        this.effects = Object.assign(GraphicElement.defaulteffects(), effects);
        this.sticked = false;

        this.vector.setMaxVelocity(this.options.maxspeed, this.options.maxgravity);

        this.controlled = this.options.controlled;
        this.options.gravity && this.applyGravity(this.options.gravity);

        if (this.options.velocity) {
            this.vector.setVelocity(this.options.velocity.x, this.options.velocity.y);
        }

        if (this.options.acceleration) {
            this.vector.setAcceleration(this.options.acceleration.x, this.options.acceleration.y);
        }

        switch (this.type) {
            case "image":
                this.initImage();
                break;

            case "sprite":
                this.initSprite();
                break;

            case "area":
                this.initArea();
                break;

            case "background":
            case "fog":
            case "pan":
                this.initBackground();
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
            this.drawable = this.options.sprite;
        }
    }, {
        key: 'initBackground',
        value: function initBackground() {
            this.drawable = new Pan(this.options);
        }
    }, {
        key: 'initImage',
        value: function initImage() {
            this.url = this.options.url;

            this.drawable = new Sprite({
                spritesets: {
                    neutral: new SpriteSet('file', this.url)
                },
                useimagesize: this.options.useimagesize
            });

            if (this.options.pattern) {
                this.drawable.createPattern(this.game.context, this.options.patternsize);
            }

            log('GElement', "Initialized Graphic Element with image at " + this.url);
        }
    }, {
        key: 'initArea',
        value: function initArea() {
            this.drawable = new Area();
            log('Gelement', 'Initialized Graphic Element with an area');
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
                this.drawable.changeState('jumping');
                this.sticked = false;
            } else if (this.vector.vely > 0) {
                this.drawable.changeState('falling');
                this.sticked = false;
            } else if (this.vector.velx != 0) {
                this.drawable.changeState('running');
            } else {
                this.drawable.changeState('neutral');
            }
        }
    }, {
        key: 'on',
        value: function on(eventname, callback) {
            this.drawable.on(eventname, callback);
        }
    }, {
        key: 'shouldBeDrawn',
        value: function shouldBeDrawn(camera) {
            return this.vector.x - camera.rect.x + this.rect.x > 0 && this.vector.x - camera.rect.x < camera.rect.w && this.vector.y - camera.rect.y + this.rect.y > 0 && this.vector.y - camera.rect.y < camera.rect.h;
        }
    }, {
        key: 'restrict',
        value: function restrict(camera, size) {
            if (this.vector.x + this.collision.x < 0) {
                this.vector.x = -this.collision.x;
                this.vector.velx = 0;
                this.vector.accelx = 0;
            } else if (this.vector.x + this.collision.x + this.collision.w > size.x) {
                this.vector.x = size.x - this.collision.x - this.collision.w;
                this.vector.velx = 0;
                this.vector.accelx = 0;
            }

            if (-(this.vector.y + this.collision.y) > size.y - camera.rect.h) {
                this.vector.y = -(size.y - camera.rect.h) - this.collision.y;
                this.vector.vely = 0;
            }
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

                if (this.drawable.collide(gelement, CollisionMatrixDirections[smallindex])) {
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
                if (!this.options.through) {
                    context.beginPath();
                    context.rect(this.collision.x + pos.x, this.collision.y + pos.y, this.collision.w || pos.w, this.collision.h || pos.h);
                    context.lineWidth = 1;
                    context.strokeStyle = 'red';
                    context.stroke();
                }

                context.beginPath();
                context.rect(pos.x, pos.y, pos.w, pos.h);
                context.lineWidth = 1;
                context.strokeStyle = 'blue';
                context.stroke();
            }

            context.font = "bold 12px Arial, sans-serif";
            context.fillStyle = "green";
            context.fillText((this.id && this.id + ", " || "") + this.type, pos.x, pos.y - 8);

            context.font = "normal 12px Arial, sans-serif";
            context.fillStyle = "black";
            context.fillText("Relative " + this.vector.x + " x " + this.vector.y, pos.x + pos.w + 5, pos.y + 10);
            context.fillText("Real " + (this.vector.x - camera.rect.x) + " x " + (this.vector.y - camera.rect.y), pos.x + pos.w + 5, pos.y + 24);
            context.fillText("Velocity " + this.vector.velx + " x " + this.vector.vely, pos.x + pos.w + 5, pos.y + 38);
            context.fillText("Acceleration " + this.vector.accelx + " x " + this.vector.accely, pos.x + pos.w + 5, pos.y + 52);
            context.fillText("State : " + this.drawable.state + (this.controlled ? ", controlled" : ""), pos.x + pos.w + 5, pos.y + 66);
            context.fillText("Drawn : " + (drawn ? "Yes" : "No"), pos.x + pos.w + 5, pos.y + 80);
            context.fillText("Can collide : " + (this.options.through ? "No" : "Yes"), pos.x + pos.w + 5, pos.y + 94);
        }
    }, {
        key: 'draw',
        value: function draw(context, camera) {
            var drawn = false;
            if (this.drawable.alwaysDraw || this.shouldBeDrawn(camera)) {
                context.save();
                context.globalAlpha = this.effects.opacity;
                context.globalCompositeOperation = this.effects.composite;
                var pos = this.drawable.draw(context, camera.origin.x + this.vector.x - camera.rect.x, camera.origin.y + this.vector.y - camera.rect.y, this.rect.x, this.rect.y, camera);
                if (pos && this.effects.stroke) {
                    context.beginPath();
                    context.rect(pos.x, pos.y, pos.w, pos.h);
                    context.lineWidth = this.effects.stroke.width;
                    context.strokeStyle = this.effects.stroke.style;
                    context.stroke();
                }
                context.restore();

                drawn = !!pos;
                if (this.options.useimagesize && pos) {
                    this.rect.x = pos.w;
                    this.rect.y = pos.h;
                }
            }

            if (this.game.dev) {
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
                        this.drawable.changeState(this.drawable.state, "right");
                        break;

                    case Keyboard.KEY_LEFT:
                        // this.vector.setVelocity(-this.options.initspeed, this.vector.vely);
                        this.direction = "left";
                        this.keydown = true;
                        this.vector.setAcceleration(-this.options.friction, this.vector.accely);
                        this.drawable.changeState(this.drawable.state, "left");
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
                } else if (this.vector.velx != 0) {
                    this.vector.setAcceleration(this.options.friction * -mod, this.vector.accely, true);
                }

                this.drawable.changeState();
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
        key: 'giveupControl',
        value: function giveupControl() {
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
                this.giveupControl();
            }
        }
    }, {
        key: 'ready',
        get: function get() {
            return this.drawable.currentState.ready;
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

},{"./area":3,"./dom":7,"./keyboard":11,"./log":13,"./pan":15,"./physics":16,"./sprite":17,"./spriteset":18}],9:[function(require,module,exports){
(function (global){
"use strict";

var __SIDESCROLLGAME = {
    env: "dev"
};

var glob = typeof "window" === "undefined" ? global : window;
glob.__SIDESCROLLGAME = __SIDESCROLLGAME;

module.exports = glob;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var Camera = require('./camera');
var Physics = require('./physics');

var GraphicLayer = function () {
    function GraphicLayer(index, size) {
        _classCallCheck(this, GraphicLayer);

        this.index = index;
        this.size = size;

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
        key: 'destroy',
        value: function destroy() {
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
                this.graphicselements[i].options.fixedtostage && this.graphicselements[i].restrict(camera, this.size);
                if (this.graphicselements[i].options.through) {
                    continue;
                }

                for (var j = i + 1; j < this.graphicselements.length; j++) {
                    if (this.graphicselements[j].options.through) {
                        continue;
                    }

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
    _createClass(Graphics, null, [{
        key: 'defaultOptions',
        value: function defaultOptions() {
            return {
                bgcolor: "#E7E5E2"
            };
        }
    }]);

    function Graphics(context) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var size = arguments[2];

        _classCallCheck(this, Graphics);

        this.context = this.c = context;
        this.options = Object.assign(Graphics.defaultOptions(), options);
        this.size = size;
        this.camera = new Camera(options.origin.x, options.origin.y, context.width, context.height, options.verticalModifier);
        this.camera.setLimits(this.size);

        this.backLayer = new GraphicLayer(-2, size);
        this.layers = [];
        this.frontLayer = new GraphicLayer(-1, size);

        for (var i = 0; i < options.layers; i++) {
            this.layers.push(new GraphicLayer(i, size));
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
        key: 'addElementToFixed',
        value: function addElementToFixed(elementid, element, front) {
            front ? this.frontLayer.addElement(elementid, element) : this.backLayer.addElement(elementid, element);
        }
    }, {
        key: 'addElement',
        value: function addElement(layerid, elementid, element) {
            element.id = elementid;
            this.layers[layerid].addElement(elementid, element);

            return element;
        }
    }, {
        key: 'update',
        value: function update() {
            var _this = this;

            this.camera.update();

            this.backLayer.update();
            this.layers.forEach(function (x) {
                return x.update().impactCheck(_this.context, _this.camera).updateStates();
            });
            this.frontLayer.update();
        }
    }, {
        key: 'draw',
        value: function draw() {
            var _this2 = this;

            this.backLayer.draw(this.context, this.camera);
            this.layers.forEach(function (x) {
                return x.draw(_this2.context, _this2.camera);
            });
            this.frontLayer.draw(this.context, this.camera);
        }
    }]);

    return Graphics;
}();

module.exports = Graphics;

},{"./camera":5,"./log":13,"./physics":16}],11:[function(require,module,exports){
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

},{"./glob":9,"./log":13}],12:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');

var LOADER_CACHE = {};

var Loader = function () {
    function Loader() {
        _classCallCheck(this, Loader);
    }

    _createClass(Loader, [{
        key: 'request',
        value: function request(url, type, done, parsejson) {
            if (LOADER_CACHE[url]) {
                return done && done(LOADER_CACHE[url]);
            }

            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = type;

            request.onload = function () {
                var response = request.response;
                log('Loader', 'Loaded data with type ' + type + ' from URL ' + url);
                LOADER_CACHE[url] = response;
                done && done(response);
            };
            request.send();
        }
    }, {
        key: 'loadStage',
        value: function loadStage(url, game, done) {
            this.request(url, "json", function (rawstage) {
                var stage = game.world.createStageFromRaw(game, rawstage);
                done && done(stage);
            }, true);
        }
    }, {
        key: 'loadWorld',
        value: function loadWorld(url, game, done) {
            this.request(url, "json", function (rawworld) {
                game.world.appendFromRaw(game, rawworld);
                done && done(game.world);
            }, true);
        }
    }, {
        key: 'loadAudio',
        value: function loadAudio(url, sound, done) {
            this.request(url, 'arraybuffer', function (data) {
                sound.setBuffer(data);
                sound.onready && sound.onready();

                done && done(data);
            });
        }
    }]);

    return Loader;
}();

module.exports = Loader;

},{"./log":13}],13:[function(require,module,exports){
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

},{"./glob.js":9}],14:[function(require,module,exports){
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

},{"./log":13,"./physics":16}],15:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('./log');
var Drawable = require('./abstract/drawable');
var Physics = require('./physics');

var Pan = function (_Drawable) {
    _inherits(Pan, _Drawable);

    _createClass(Pan, null, [{
        key: 'defaultoptions',
        value: function defaultoptions() {
            return {
                modifier: { x: 1, y: 1 },
                through: true
            };
        }
    }]);

    function Pan() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Pan);

        var _this = _possibleConstructorReturn(this, (Pan.__proto__ || Object.getPrototypeOf(Pan)).apply(this, arguments));

        _this.ready = false;
        _this.options = Object.assign(Pan.defaultoptions(), options);
        _this.bitmap;
        _this.pattern;

        _this.options.url && _this.load(_this.options.url);
        return _this;
    }

    _createClass(Pan, [{
        key: 'load',
        value: function load(url) {
            var _this2 = this;

            var img = new Image();
            img.onload = function () {
                createImageBitmap(img).then(function (bitmap) {
                    _this2.bitmap = bitmap;
                    _this2.ready = true;
                    _this2.onready && _this2.onready(bitmap);
                });
            };

            img.src = url;
        }
    }, {
        key: 'draw',
        value: function draw(context, x, y, w, h, camera) {
            if (!this.ready) {
                return { x: x, y: y, w: w, h: h };
            } else if (!this.pattern) {
                this.pattern = context.createPattern(this.bitmap, 'repeat');
            }

            var rect = [x * this.options.modifier.x, y * this.options.modifier.y - (this.bitmap.height - camera.rect.h), camera.rect.w, camera.rect.h];

            context.fillStyle = this.pattern;
            context.translate(rect[0], rect[1]);
            context.fillRect(-rect[0], -rect[1], rect[2], rect[3]);
            context.translate(-rect[0], -rect[1]);

            return new (Function.prototype.bind.apply(Physics.Rect, [null].concat(rect)))();
        }
    }, {
        key: 'collide',
        value: function collide() {
            return false;
        }
    }, {
        key: 'destroy',
        value: function destroy() {}
    }, {
        key: 'alwaysDraw',
        get: function get() {
            return true;
        }
    }]);

    return Pan;
}(Drawable);

module.exports = Pan;

},{"./abstract/drawable":2,"./log":13,"./physics":16}],16:[function(require,module,exports){
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
        value: function at() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            this.x = x;
            this.y = y;
        }
    }, {
        key: "to",
        value: function to() {
            var destx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var desty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            this.destx = destx;
            this.desty = desty;
        }
    }, {
        key: "setMaxVelocity",
        value: function setMaxVelocity() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            this.maxvelx = x;
            this.maxvely = y;
        }
    }, {
        key: "setVelocity",
        value: function setVelocity() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            this.velx = x;
            this.vely = y;
        }
    }, {
        key: "setAcceleration",
        value: function setAcceleration() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var breakatzerox = arguments[2];
            var breakatzeroy = arguments[3];

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
    function Rect() {
        var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var w = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var h = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

        _classCallCheck(this, Rect);

        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    _createClass(Rect, [{
        key: "spread",
        value: function spread() {
            return [this.x, this.y, this.w, this.h];
        }
    }, {
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
            return !(a.y + a.h <= b.y || a.y >= b.y + b.h || a.x + a.w <= b.x || a.x >= b.x + b.w);
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

},{}],17:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = require('./log');
var Physics = require('./physics');
var Drawable = require('./abstract/drawable');

var Sprite = function (_Drawable) {
    _inherits(Sprite, _Drawable);

    function Sprite() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Sprite);

        var _this = _possibleConstructorReturn(this, (Sprite.__proto__ || Object.getPrototypeOf(Sprite)).call(this, options));

        _this.options = options;

        _this.state = options.state || "neutral";
        _this.facing = options.facing || "right";
        _this.initialstate = _this.state;
        _this.pattern = options.pattern;
        _this.spritesets = {};

        for (var name in options.spritesets || {}) {
            _this.addState(name, options.spritesets[name]);
        }
        return _this;
    }

    _createClass(Sprite, [{
        key: 'createPattern',
        value: function createPattern(context, size) {
            this.pattern = true;
            for (var name in this.spritesets) {
                this.spritesets[name].createPattern(context, size);
            }
        }
    }, {
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
            var pos = void 0;
            context.save();
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
}(Drawable);

module.exports = Sprite;

},{"./abstract/drawable":2,"./log":13,"./physics":16}],18:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var Physics = require('./physics');
var DOM = require('./dom');
var Drawable = require('./abstract/drawable');

var SpriteState = function SpriteState(bitmap, index) {
    _classCallCheck(this, SpriteState);

    this.bitmap = bitmap;
    this.index = index;
};

var SpriteSet = function (_Drawable) {
    _inherits(SpriteSet, _Drawable);

    function SpriteSet(type, urlscheme, totalstates, framestateupdate, noloop) {
        _classCallCheck(this, SpriteSet);

        var _this = _possibleConstructorReturn(this, (SpriteSet.__proto__ || Object.getPrototypeOf(SpriteSet)).call(this));

        _this.type = type;
        _this.url = urlscheme;
        _this.frame = 0;
        _this.framestateupdate = framestateupdate || false;
        _this.drew = 0;
        _this.ready = false;
        _this.totalstates = totalstates || 1;
        _this.noloop = noloop;
        _this.states = [];
        _this.patterns = [];
        _this.pattern = false;

        log('SpriteSet', 'Creating new Sprite Set from ' + _this.url + ' with ' + _this.totalstates + ' states');
        if (type === "singleimage") {
            // TODO : Handle multiple states in single image
        } else if (type === "file") {
            _this.load();
        } else if (type === "fileset") {
            _this.load();
        } else {
            throw new Error("Created a SpriteSet with an invalid type : " + type);
        }
        return _this;
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
            var _this2 = this;

            if (this.type == "singleimage") {
                // TODO : Handle loading states from one image
            } else {
                log('SpriteSet', 'Loading states from url scheme ' + this.url);
                var imageIndex = -1;
                var loadNextImage = function loadNextImage() {
                    if (++imageIndex == _this2.totalstates) {
                        _this2.onready && _this2.onready();

                        _this2.ready = true;
                        log('SpriteSet', 'Done loading states for SpriteSet with url ' + _this2.url);

                        return done && done();
                    }

                    _this2.getImageFromURL(_this2.url.replace('$', imageIndex + 1), function (bitmap) {
                        _this2.states.push(bitmap);
                        loadNextImage();
                    });
                };

                loadNextImage();
            }
        }
    }, {
        key: 'createPattern',
        value: function createPattern(context, imagesize) {
            var _this3 = this;

            this.pattern = true;

            var actuallyCreatePattern = function actuallyCreatePattern() {
                _this3.states.forEach(function (state) {
                    var offCanvas = DOM.create({ node: "canvas" });
                    if (!imagesize) {
                        imagesize = new Physics.Vector2D(state.width, state.height);
                    }

                    offCanvas.width = imagesize.x;
                    offCanvas.height = imagesize.y;
                    offCanvas.getContext('2d').drawImage(state, 0, 0, imagesize.x, imagesize.y);

                    _this3.patterns.push({
                        pattern: context.createPattern(offCanvas, "repeat"),
                        canvas: offCanvas
                    });
                });

                log('SpriteSet', 'Loaded pattern for ' + _this3.states.length + " states");
            };

            if (this.ready) {
                actuallyCreatePattern();
            } else {
                this.onready = actuallyCreatePattern;
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
            if (this.pattern) {
                context.fillStyle = this.currentPattern.pattern;
                context.fillRect(x, y, w, h);
            } else {
                context.drawImage(this.currentFrame, x, y, w, h);
            }
            this.drew++;
            if (this.framestateupdate && this.drew == this.framestateupdate) {
                this.drew = 0;
                this.nextFrame();
            }

            return new Physics.Rect(x, y, w, h);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.patterns.forEach(function (pat) {
                pat.canvas.remove();
                pat.pattern = undefined; // Not sure if necessary
            });
        }
    }, {
        key: 'currentFrame',
        get: function get() {
            return this.states[this.frame];
        }
    }, {
        key: 'currentPattern',
        get: function get() {
            return this.patterns[this.frame];
        }
    }]);

    return SpriteSet;
}(Drawable);

module.exports = SpriteSet;

},{"./abstract/drawable":2,"./dom":7,"./log":13,"./physics":16}],19:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = require('./log');
var glob = require('./glob');
var Physics = require('./physics');
var Graphics = require('./graphics');
var GraphicElement = require('./gelement');
var Sprite = require('./sprite');
var SpriteSet = require('./spriteset');

var World = function () {
    function World(game) {
        var stages = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, World);

        this.context = game.context;
        this.audio = game.audio;
        this.stages = stages;
        this.currentStage;
    }

    _createClass(World, [{
        key: 'createStage',
        value: function createStage(id) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var overwrite = arguments[2];
            var switchto = arguments[3];

            if (!overwrite && this.stages[id]) {
                throw new Error('[World] Stage with id ' + id + ' already exists');
            }

            var stage = new Stage(id, this.context, options);
            this.stages[id] = stage;
            stage.fire("added");

            switchto && this.switchStage(id);

            return stage;
        }
    }, {
        key: 'appendFromRaw',
        value: function appendFromRaw(game, raw) {
            var _this = this;

            log('World', 'Adding to World object from raw JSON data');
            if (raw.stages) {
                raw.stages.forEach(function (rawstage) {
                    _this.createStageFromRaw(game, rawstage);
                });
            }
        }
    }, {
        key: 'createStageFromRaw',
        value: function createStageFromRaw(game, raw) {
            log('Stage', 'Building Stage object from raw JSON data');
            if (raw.options) {
                if (raw.options.size) {
                    raw.options.size = new (Function.prototype.bind.apply(Physics.Vector2D, [null].concat(_toConsumableArray(raw.options.size))))();
                }
            }

            raw.resources && raw.resources.forEach(function (res) {
                switch (res.type) {
                    case "audio":
                        game.audio.load(res.id, res.url);
                        break;
                }
            });

            raw.templates && raw.templates.forEach(function (template) {
                GraphicElement.createTemplate(template.id, template.type, template.options, template.effects);
            });

            var stage = this.createStage(raw.id, raw.options);

            raw.elements && raw.elements.forEach(function (element) {
                var elem = void 0;
                element.options = element.options || {};
                if (element.options.sprite) {
                    var spritesets = {};
                    if (element.options.sprite.spritesets) for (var state in element.options.sprite.spritesets) {
                        spritesets[state] = new (Function.prototype.bind.apply(SpriteSet, [null].concat(_toConsumableArray(element.options.sprite.spritesets[state]))))();
                    }

                    element.options.sprite = new Sprite({ spritesets: spritesets });
                }

                if (element.options.collision) {
                    element.options.collision = new (Function.prototype.bind.apply(Physics.Rect, [null].concat(_toConsumableArray(element.options.collision))))();
                }

                if (element.options.velocity) {
                    element.vector.setVelocity(element.options.velocity.x, element.options.velocity.y);
                }

                if (element.options.acceleration) {
                    element.vector.setAcceleration(element.options.acceleration.x, element.options.acceleration.y);
                }

                if (element.template) {
                    elem = stage.addElement(element.layer, element.id, GraphicElement.fromTemplate(game, element.template, element.options));
                } else {
                    elem = stage.addElement(element.layer, element.id, new GraphicElement(game, element.type, element.options));
                }

                if (element.on) {
                    for (var hookname in element.on) {
                        elem.on(hookname, glob[element.on[hookname]]);
                    }
                }

                if (element.controlled) {
                    elem.control(game.keyboard, { arrows: true });
                }

                if (element.followed) {
                    stage.follow(elem);
                }
            });

            if (stage.options.background) {
                var background = stage.addElementToFixed(stage.options.background.id, GraphicElement.fromTemplate(game, stage.options.background.template, stage.options.background.options, stage.options.background.effets));
            }

            if (stage.options.fog) {
                var fog = stage.addElementToFixed(stage.options.fog.id, GraphicElement.fromTemplate(game, stage.options.fog.template, stage.options.fog.options, stage.options.fog.effects), true);
            }

            return stage;
        }
    }, {
        key: 'switchStage',
        value: function switchStage(id) {
            log('World', 'Switching to stage with id ' + id);
            if (!this.stages[id]) {
                throw new Error('[World] Stage with id ' + id + ' does not exist');
            }

            this.currentStage && this.currentStage.fire("switchout");
            this.currentStage = this.stages[id];

            if (this.currentStage.options.song) {
                this.audio.play(this.currentStage.options.song, 0, 0, true);
            }

            this.currentStage.fire("switchin");
        }
    }, {
        key: 'resize',
        value: function resize(w, h) {
            for (var id in this.stages) {
                this.stages[id].graphics.resize(w, h);
            }
        }
    }, {
        key: 'update',
        value: function update() {
            this.stage.update();
        }
    }, {
        key: 'draw',
        value: function draw() {
            this.stage.draw();
        }
    }, {
        key: 'hasStage',
        value: function hasStage() {
            return !!this.currentStage;
        }
    }, {
        key: 'stage',
        get: function get() {
            return this.currentStage;
        }
    }]);

    return World;
}();

/*
 *  Events : added, switchout, switchin
 * */


var Stage = function () {
    _createClass(Stage, null, [{
        key: 'defaultOptions',
        value: function defaultOptions() {
            return {
                size: new Physics.Vector2D(1920, 1080),
                origin: new Physics.Vector2D(0, 0),
                verticalModifier: 1,
                song: undefined,
                hooks: {},
                layers: 5
            };
        }
    }]);

    function Stage(id, context) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, Stage);

        this.id = id;
        this.options = Object.assign(Stage.defaultOptions(), options);
        this.context = context;

        log('Stage', 'Created Stage with size : ' + this.options.size);
        this.graphics = new Graphics(this.context, this.options, this.options.size);
    }

    _createClass(Stage, [{
        key: 'fire',
        value: function fire(event, extra) {
            var callback = this.options.hooks[event];
            callback && callback(extra);
        }
    }, {
        key: 'on',
        value: function on(event, callback) {
            this.hooks[event] = callback;
        }
    }, {
        key: 'update',
        value: function update() {
            this.graphics.update();
        }
    }, {
        key: 'draw',
        value: function draw() {
            this.graphics.clear();
            this.graphics.draw();
        }

        // Shortcut

    }, {
        key: 'addElement',
        value: function addElement() {
            var _graphics;

            return (_graphics = this.graphics).addElement.apply(_graphics, arguments);
        }
    }, {
        key: 'addElementToFixed',
        value: function addElementToFixed() {
            var _graphics2;

            return (_graphics2 = this.graphics).addElementToFixed.apply(_graphics2, arguments);
        }
    }, {
        key: 'follow',
        value: function follow() {
            var _graphics$camera;

            return (_graphics$camera = this.graphics.camera).follow.apply(_graphics$camera, arguments);
        }
    }]);

    return Stage;
}();

module.exports = World;

},{"./gelement":8,"./glob":9,"./graphics":10,"./log":13,"./physics":16,"./sprite":17,"./spriteset":18}]},{},[1]);
