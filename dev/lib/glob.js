const __SIDESCROLLGAME = {
    env : "dev"
};

const glob = typeof "window" === "undefined" ? global : window;
glob.__SIDESCROLLGAME = __SIDESCROLLGAME;

module.exports = glob;
