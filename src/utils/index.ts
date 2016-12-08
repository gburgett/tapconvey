import { Readable } from 'stream'

/* Turns a string into a Readable stream */
export function stringToStream(str: string, highWaterMark?: number): Readable {
  var buf = Buffer.from(str)
  return new Readable({
    highWaterMark: highWaterMark,
    read(size) {
      do {
        var toPush
        if (!buf) {
          toPush = null
        } else if (size > buf.length) {
          toPush = buf
          buf = null
        } else {
          toPush = buf.slice(0, size)
          buf = buf.slice(size, buf.length)
        }
      } while (this.push(toPush))
    }
  })
}
