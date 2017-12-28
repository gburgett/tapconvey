"use strict";
const stream_1 = require("stream");
function stringToStream(str, highWaterMark) {
    var buf = Buffer.from(str);
    return new stream_1.Readable({
        highWaterMark: highWaterMark,
        read(size) {
            do {
                var toPush;
                if (!buf) {
                    toPush = null;
                }
                else if (size > buf.length) {
                    toPush = buf;
                    buf = null;
                }
                else {
                    toPush = buf.slice(0, size);
                    buf = buf.slice(size, buf.length);
                }
            } while (this.push(toPush));
        }
    });
}
exports.stringToStream = stringToStream;
