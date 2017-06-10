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
            const key = await stream.getString(4);
            await stream.getString(1);
            const val = await stream.getString(1);
            return new testPattern(key, val);
        }
    }
    class Quatrains {
        constructor(heaer, jaw, neck, tail) {
            this.heaer = heaer;
            this.jaw = jaw;
            this.neck = neck;
            this.tail = tail;
        }
        static async constructorFromStream(stream) {
            const head = await stream.getLine();
            const jaw = await stream.getLine();
            const neck = await stream.getLine();
            const tail = await stream.getLine();
            return new Quatrains(head, jaw, neck, tail);
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

            const streamParser = new StreamParser(testPattern, (obj) => {
                count = count + 1;
                try {
                    expect(obj).to.be.eql(new testPattern("test", "a"));
                } catch (e) {
                    reject(e);
                }

                if (count === 3) {
                    resolve("ok");
                }
            });

            bufferStream.pipe(streamParser);
        });
    });
    it("should parser twoTestPattern from  socket which send sucess", async () => {
        await new Promise((resolve, reject) => {
            const buffer = Buffer.from("test:atest:a");
            var bufferStream = new PassThrough();
            bufferStream.end(buffer);

            const streamParser = new StreamParser(twoTestPattern, (obj) => {
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
    it("should parser two  quatrains from  stream", async () => {
        let count = 0;
        const quatrainsMap = [new Quatrains("朝辞白帝彩云间", "千里江陵一日还", "两岸猿声啼不住", "轻舟已过万重山"),
        new Quatrains("床前明月光", "疑是地上霜", "舉頭望明月", "低頭思故鄉")];
        await new Promise((resolve, reject) => {
            const buffer = Buffer.from(
                `朝辞白帝彩云间\n千里江陵一日还\n两岸猿声啼不住\n轻舟已过万重山\n`);
            var bufferStream = new PassThrough();
            bufferStream.write(buffer);
            const streamParser = new StreamParser(Quatrains, (obj) => {
                count++;
                try {
                    expect(obj).to.be.eql(quatrainsMap[count - 1])
                } catch (e) {
                    reject(e);
                }
                if (count === 2) {
                    resolve("ok");
                }
            });

            bufferStream.pipe(streamParser);

            bufferStream.write(Buffer.from(`床前明月光\n疑是地上霜\n舉頭望明月\n低頭思故鄉\n`));
            bufferStream.end();


        });
    });

});
