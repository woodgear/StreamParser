const expect = require('chai').expect;
const net = require('net');
const PassThrough = require('stream').PassThrough;
const StreamParser = require('../src/StreamParser');

describe("StreamParser", () => {
    class testPattern {
        constructor(key, val) {
            this.key = key;
            this.val = val;
        }
        static async constructorFromStream(stream) {
            let data = await stream.get(4);
            const key = data.toString();
            data = await stream.get(1);
            data = await stream.get(1);
            const val = data.toString();
            return new testPattern(key, val);
        }
    }
    class twoTestPattern {
        constructor(test1, test2) {
            this.test1 = test1;
            this.test2 = test2;
        }
        static async constructorFromStream(stream) {
            const test1 = await stream.parser(testPattern);
            const test2 = await stream.parser(testPattern);
            return new twoTestPattern(test1, test2);
        }

    }

    it("should parser 3 object from  socket which send sucess", async () => {
        let count = 0;
        await new Promise((resolve, reject) => {
            const buffer = Buffer.from("test:atest:atest:a");
            var bufferStream = new PassThrough();
            bufferStream.end(buffer);
            bufferStream.pipe(new StreamParser({}, testPattern, (obj) => {
                count = count + 1;
                try {
                    expect(obj).to.be.eql(new testPattern("test", "a"));
                } catch (e) {
                    reject(e);
                }

                if (count === 3) {
                    resolve("ok");
                }
            }));
        });
    });
    it("should parser twoTestPattern from  socket which send sucess", async () => {
        await new Promise((resolve, reject) => {
            const buffer = Buffer.from("test:atest:a");
            var bufferStream = new PassThrough();
            bufferStream.end(buffer);

            const streamParser = new StreamParser({}, twoTestPattern, (obj) => {
                try {
                    expect(obj).to.be.eql(new twoTestPattern(new testPattern('test', 'a'), new testPattern('test', 'a')))
                } catch (e) {
                    reject(e);
                }
                resolve("ok");
            });

            bufferStream.pipe(streamParser);

        });
    });

});
