const { Writable } = require('stream');
class BufferNotify {
    constructor() {
        this.buffer = Buffer.alloc(0);
        this.start = 0;
        this.length = this.buffer.length;
        this.events = [];
    }
    apped(buffer) {
        this.buffer = Buffer.concat([this.buffer, buffer]);
        this.length = this.buffer.length - this.start;
        this.notify();
    }
    notify() {
        this.events.forEach((item, index, array) => {
            if (this.length > item.len) {
                const data = this.pick(item.len);
                item.callback(data);
                array.splice(item);
            } else {
                return;
            }
        })
    }
    //this will be call while this buffer is enough to get
    pick(len) {
        const data = this.buffer.slice(this.start, this.start + len);
        this.start += len;
        this.length = this.buffer.length - this.start;
        return data;
    }
    addListener(len, callback) {
        this.events.push({ len, callback });
    }

    async parser(obj) {
        return obj.constructorFromStream(this);
    }

    async get(len) {
        if (this.length >= len) {
            return this.pick(len);
        } else {
            return new Promise((resolve, reject) => {
                this.addListener(len, (data) => {
                    resolve(data);
                });
            });
        }
    }

    async read(len) {
        const data = await get(len);
    }
}
class StreamParser extends Writable {
    constructor(config, pattern, OnParsedLisener) {
        super({});
        this.config = config;
        this.OnParsedLisener = OnParsedLisener;
        this.pattern = pattern;
        this.buffer = new BufferNotify();
        this.isFinished = false;

        this.on("finish", () => {
            this.isFinished = true;
        });

        this.startParser(this.pattern, this.buffer, this.OnParsedLisener);
    }
    isFinish() {
        return this.isFinished && this.buffer.length === 0;
    }
    async startParser(pattern, buffer, OnParsedLisener) {
        while (!this.isFinish()) {
            const obj = await pattern.constructorFromStream(buffer);
            OnParsedLisener(obj);
        }
    }

    _write(chunk, encoding, callback) {
        this.buffer.apped(chunk);
        callback();
    }
}
module.exports = StreamParser;
