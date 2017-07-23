const glob = require('./glob.js');
const noOp = () => {};
let event;

const log = (sender, str) => {
    console.log(`[${new Date()} - ${sender}] ${str}`);
    event && event(sender, str);
}

log.listen = (cb) => {
    event = cb;
}

module.exports = glob.__SIDESCROLLGAME.env == "dev" ? log : noOp;
