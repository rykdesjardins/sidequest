(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var glob = require('./lib/glob');
var log = require('./lib/log');
var Debugger = require('./lib/debugger');
var Mouse = require('./lib/mouse');
var Graphics = require('./lib/graphics');

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
            this.canvas.width = glob.innerWidth;
            this.canvas.height = glob.innerHeight;
            this.graphics.resize(glob.innerWidth, glob.innerHeight);

            log("Game", 'Handled resized at ' + glob.innerWidth + ' x ' + glob.innerHeight);
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

glob.SideQuest = {
    Game: Game,
    GraphicElement: require('./lib/gelement'),
    Physics: require('./lib/physics')
};

},{"./lib/debugger":2,"./lib/gelement":4,"./lib/glob":5,"./lib/graphics":6,"./lib/log":7,"./lib/mouse":8,"./lib/physics":9}],2:[function(require,module,exports){
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
            var _this = this,
                _arguments = arguments;

            glob.onerror = function () {
                return _this.error.apply(_this, _arguments);
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
            d.create({ node: "pre", html: _error.stack, attr: { style: "color : red;" }, parent: this.outputelem });
        }
    }]);

    return GameDebugger;
}();

module.exports = GameDebugger;

},{"./dom":3,"./glob":5,"./log":7}],3:[function(require,module,exports){
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

var GraphicElement = function () {
    function GraphicElement(type, extra) {
        _classCallCheck(this, GraphicElement);

        this.ready = false;
        this.type = type;
        this.options = extra || {};
        this.vector = new Physics.Vector2D(this.options.x || 0, this.options.y || 0);
        this.rect = new Physics.Vector2D(this.options.w || 0, this.options.h || 0);

        switch (this.type) {
            case "image":
                this.initImage(this.options.url);
                this.options.preload && this.preload();
                break;

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
        key: 'initImage',
        value: function initImage(url) {
            this.url = url;
            this.image = new Image();
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
                    _this.options.preloadcallback && _this.options.preloadcallback(_this);
                });
            };

            this.image.src = this.url;
        }
    }, {
        key: 'initShape',
        value: function initShape(info) {}
    }, {
        key: 'drawImage',
        value: function drawImage(context) {
            this.imagebitmap && context.drawImage(this.imagebitmap, this.vector.x, this.vector.y, this.rect.x, this.rect.y);
        }
    }, {
        key: 'drawShape',
        value: function drawShape() {}
    }, {
        key: 'draw',
        value: function draw(context) {
            throw new Error("Tried to draw a GElement with an invalid type : " + this.type);
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            log('GElement', 'Destroyed Graphic Element of type ' + this.type);
            this.imagebitmap && this.imagebitmap.close();
            this.image && this.image.remove();
        }
    }]);

    return GraphicElement;
}();

module.exports = GraphicElement;

},{"./dom":3,"./log":7,"./physics":9}],5:[function(require,module,exports){
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

},{"./log":7}],7:[function(require,module,exports){
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

},{"./glob.js":5}],8:[function(require,module,exports){
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

},{"./log":7,"./physics":9}],9:[function(require,module,exports){
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
        key: "length",
        value: function length() {
            return Math.sqrt(Math.pow(this.x - this.destx, 2) + Math.pow(this.y - this.desty, 2));
        }
    }]);

    return Vector2D;
}();

module.exports = { Vector2D: Vector2D };

},{}]},{},[1]);
