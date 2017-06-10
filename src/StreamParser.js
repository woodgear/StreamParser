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
            const trigger = item.trigger;
            switch (trigger.type) {
                case "length":
                    if (this.length > trigger.content) {
                        item.callback(this.pick(trigger.content));
                    } else {
                        return;
                    }
                    break;
                case "contains":
                    const index = this.buffer.indexOf(trigger.content, this.start + 1);

                    if (index != -1) {
                        const data = this.pick(index - this.start + 1);
                        item.callback(data.toString());
                    } else {
                        return;
                    }
                    break;
                default:
                    return;
            }
            return;
        })
    }
    //this will be call while this buffer is enough to get
    pick(len) {
        const data = this.buffer.slice(this.start, this.start + len);
        this.start += len;
        this.length = this.buffer.length - this.start;
        return data;
    }
    addListener(trigger, callback) {
        this.events.push({ "trigger": trigger, "callback": callback });
    }

    async parser(obj) {
        return obj.constructorFromStream(this);
    }

    async get(len) {
        if (this.length >= len) {
            return this.pick(len);
        } else {
            return new Promise((resolve, reject) => {
                this.addListener({ type: "length", content: len }, (data) => {
                    resolve(data);
                });
            });
        }
    }

    async getString(len) {
        const data = await this.get(len);
        return data.toString();
    }

    async getLine() {
        const index = this.buffer.indexOf("\n", this.start);
        if (index != -1) {
            const data = this.pick(index - this.start + 1);
            return data.toString().trim();
        } else {
            return new Promise((resolve, reject) => {
                this.addListener({ type: "contains", content: "\n" }, (data) => {
                    resolve(data.toString().trim());
                });
            });
        }
    }

}
class StreamParser extends Writable {
    constructor(pattern, OnParsedLisener) {
        super({});
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
