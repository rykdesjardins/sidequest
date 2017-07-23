const log = require('./log');
const d = require('./dom');
const glob = require('./glob');

class GameDebugger {
    constructor(canvas) {
        this.pingcount = 0;
        this.init = false;
        this.canvas = canvas;
    }

    createElem() {
        this.elem = d.create({
            node : "div", id : "gamedebugger", parent : document.body, children : [
                {node : "div", id : "debugframecount"},
                {node : "div", id : "debugfps"}
            ]
        });

        this.outputelem = d.create({
            node : "div", id : "debugoutput", parent : this.elem
        });

        this.init = true;
    }

    bindError() {
        glob.onerror = (a,b,c,d,e) => this.error(a,b,c,d,e);
    }

    addStylesheet() {
        d.create({node : "link", attr : {rel : "stylesheet", href : "/debug.css"}, parent : document.head});
    }

    report(eventtype, data) {

    }

    ping() {
        this.pingcount++;
        if (this.init) {
            d.byID('debugframecount').textContent = this.pingcount + " frames";
        }
    }

    startFPS() {
        this.lastpingat = 0;
        const fpsinterval = () => {
            d.byID('debugfps').textContent = (this.pingcount - this.lastpingat) + " FPS"
            this.lastpingat = this.pingcount;

            setTimeout(fpsinterval, 1000);
        }

        setTimeout(fpsinterval, 1000);
    }

    log(sender, str) {
        d.create({node : "div", text : `[${new Date().toLocaleTimeString()} - ${sender}] - ${str}`, parent : this.outputelem});
        this.elem.scrollTop = this.outputelem.scrollHeight;
    }

    bindCanvasEvents() {
    }

    cast() {
        this.createElem();
        this.addStylesheet();
        this.bindError();
        this.bindCanvasEvents();
        this.startFPS();
        log.listen((sender, str) => this.log(sender, str));

        log('Debugger', "Created debugger");
        this.elem.classList.add("shown");
    }

    error(msg, url, lineNo, columnNo, error) {
        d.create({node : "div", text : msg, attr : {style : "color : red;"}, parent : this.outputelem});
        d.create({node : "pre", html : error && error.stack, attr : {style : "color : red;"}, parent : this.outputelem});
    }
}

module.exports = GameDebugger;
