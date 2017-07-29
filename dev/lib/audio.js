const log = require('./log');
const Loader = require('./loader');

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
            this.source.start(time);
        });
    }

    stop() {
        this.source && this.source.stop();
    }
}

class Audio {
    constructor(totalchannel = 4) {
        this.totalchannel = totalchannel;
        this.loader = new Loader();
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
        this.loader.loadAudio(filename, AUDIO_RAW[id], done);

        return AUDIO_RAW[id];
    }

    play(id, channel = 0, time = 0, loop = false) {
        log('Audio', `Requested song with id ${id} to be played`);
        if (!AUDIO_RAW[id]) {
            throw new Error(`[Audio] Tried to play undefined sound with id ${id}`);
        }

        if (!AUDIO_RAW[id].ready) {
            log('Audio', 'Song with id ' + id + ' will play once it\'s loaded');
            AUDIO_RAW[id].onready = () => {
                log('Audio', 'Song with id ' + id + ' will now play automatically');
                this.channels[channel].play(id, time, loop);
            };
            return false;
        }

        this.channels[channel].play(id, time, loop);
    }

    stop(channel) {
        this.channels[channel].stop();
    }
}

module.exports = Audio;
