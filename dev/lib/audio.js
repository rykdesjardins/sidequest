const log = require('./log');

const AUDIO_RAW = { };

class Sound {
    constructor() {
        this.ready = false;
    }

    setBuffer(buffer) {
        this.buffer = buffer;
        this.ready = true;
    }
}

class AudioChannel {
    constructor() {
        this.context = new AudioContext();
        this.source;
    }

    play(id, time = 0, loop) {
        this.context.decodeAudioData(AUDIO_RAW[id].buffer, (data) => {
            this.source = this.context.createBufferSource();
            this.source.buffer = data;
            this.source.connect(this.context.destination);
            this.source.loop = loop;
            this.source.play(time);
        });
    }

    stop() {
        this.source && this.source.stop();
    }
}

class Audio {
    constructor(totalchannel) {
        this.totalchannel = totalchannel;
        this.channels = [];

        for (let i = 0; i < this.totalchannel; i++) {
            this.channels.push(new AudioChannel());
        }
    }

    load(id, filename, done) {
        if (AUDIO_RAW[id]) {
            throw new Error(`[Audio] Tried to register existing audio file with id ${id}`);
        }

        AUDIO_RAW[id] = new Sound();

        var request = new XMLHttpRequest();
        request.open('GET', filename, true);
        request.responseType = 'arraybuffer';

        request.onload = function() {
            AUDIO_RAW[id].setBuffer(request.response);
            done && done();
        }
        request.send();
    }

    play(id, channel = 0, time = 0, loop = false) {
        if (!AUDIO_RAW[id]) {
            throw new Error(`[Audio] Tried to play undefined sound with id ${id}`);
        }

        if (!AUDIO_RAW[id].ready) {
            return false;
        }

        this.channels[channel].play(id, time, loop);
    }

    stop(channel) {
        this.channels[channel].stop();
    }
}

module.exports = Audio;
