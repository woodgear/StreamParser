## StreamParser
从Stream(Socket file)解出Object 可用于接收自定义协议

## 使用方式
### 定义协议 
每个类中必须有个constructorFromStream 其返回值就是解出的值
```js
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

```
stream 有
1. 异步的get(len) 方法获取固定大小的buffer
2. 异步的parser(obj)方法获取对象 其中 obj 必须有constructorFromStream方法

### 定义StreamParser
```js

const buffer = Buffer.from("test:atest:a");
const bufferStream = new PassThrough();
bufferStream.end(buffer);

const streamParser = new StreamParser(twoTestPattern, (obj) => {
        expect(obj).to.be.eql(new twoTestPattern(new testPattern('test', 'a'), new testPattern('test', 'a')));
    });

bufferStream.pipe(streamParser);

```
StreamParser 接受两个参数
1. pattern 即第一步定义的模板
2. 回调 当解出一个对象时 触发此回调函数

### 使用
将 stream pipe 到 streamParser中 详情见 ./test/StreamParser.test.js
