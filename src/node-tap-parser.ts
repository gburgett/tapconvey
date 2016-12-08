import { Transform } from 'stream'
import { Results, Test, Assert, Comment } from './results'

/*
  Transform a stream of TAP formatted input
  into a Results object.
*/
export class NodeTapParser extends Transform {
  private in_progress: Results
  private to_flush: Results[]
  private current: Test
  private parser: any
  private callback

  constructor(cb?: (error: Error, result: Results) => void, parser?: any) {
    super({
      readableObjectMode: true,
      writableObjectMode: false
    })

    this.callback = cb
    this.in_progress = new Results()
    this.to_flush = []
    this.parser = parser || require('tap-parser')()
    this.parser.on('version', this._onVersion)
    this.parser.on('comment', this._onComment)
    this.parser.on('assert', this._onAssert)
    this.parser.on('plan', this._onPlan)
    this.parser.on('bailout', this._onBailout)
    this.parser.on('child', this._onChild)
    this.parser.on('extra', this._onExtra)
    this.parser.on('end', this._onComplete)
  }

  _transform(chunk: Buffer, encoding: string, callback: (Error, Any) => void) {
    console.log('toTransform: ', chunk)
    this.parser.write(chunk, encoding, callback)
  }

  _flush(cb: () => void) {
    if (this.callback && this.to_flush.length == 0) {
      this.callback(null, null)
    }
    this.to_flush.forEach(this._push)
    this.to_flush = []
    cb()
  }

  private _push(results: Results) {
    this.push(results)
    if (this.callback) {
      this.callback(null, results)
    }
  }


  private _error(error: Error) {
    if (this.callback) {
      this.callback(error, this.in_progress)
    }
    this.emit('error', error)
    this.in_progress = new Results()
    this.current = undefined
  }

  private _onExtra(extra: string) {
    console.error('onExtra: ', extra)
  }

  private _onChild(childParser: any) {
    console.error('onChild - spawning new parser')
    new NodeTapParser((error: Error, result: Results) => {
      if (error) {
        console.error('child error: ', error)
        this._error(error)
      }
    },
      childParser)
  }

  private _onBailout(reason: string) {
    console.error('onBailout: ', reason)
  }

  private _onPlan(plan: any) {
    console.error('onPlan: ', plan)
  }

  private _onAssert(assert: any) {
    console.error('onAssert: ', assert)
  }

  private _onComment(comment: string) {
    console.error('onComment: ', comment)
  }

  private _onVersion(version: string) {
    this.in_progress.version = version
    console.error('onVersion: ', version)
  }

  private _onComplete(results: any) {
    console.log('onComplete: ', results)
    this.to_flush.push(this.in_progress)
    this.in_progress = new Results()
  }
}

export default NodeTapParser
