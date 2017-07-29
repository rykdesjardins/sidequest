const log = require('./log');

const LOADER_CACHE = {};

class Loader {
    request(url, type, done, parsejson) {
        if (LOADER_CACHE[url]) {
            return done && done(LOADER_CACHE[url]);
        }

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = type;

        request.onload = function() {
            let response = request.response;
            log('Loader', `Loaded data with type ${type} from URL ${url}`);
            LOADER_CACHE[url] = response;
            done && done(response);
        }
        request.send();
    }

    loadStage(url, game, done) {
        this.request(url, "json", (rawstage) => {
            const stage = game.world.createStageFromRaw(game, rawstage);
            done && done(stage);
        }, true);
    }

    loadWorld(url, game, done) {
        this.request(url, "json", (rawworld) => {
            game.world.appendFromRaw(game, rawworld);
            done && done(game.world);
        }, true);
    }

    loadAudio(url, sound, done) {
        this.request(url, 'arraybuffer', (data) => {
            sound.setBuffer(data);
            sound.onready && sound.onready();

            done && done(data);
        });
    }
}

module.exports = Loader;
