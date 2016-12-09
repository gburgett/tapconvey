import { Transform } from 'stream'
import { Summary, Test, Assert, Comment, Log } from './results'

/*
  Transform a stream of TAP formatted input
  into a Results object.
*/
export class NodeTapParser extends Transform {
  private current: Test
  private summary: Summary
  private emittedSummary: boolean
  private stack: Test[] = []
  private parser: any
  private callback

  constructor(cb?: (error: Error, summary: Summary) => void) {
    super({
      readableObjectMode: true,
      writableObjectMode: false
    })

    this.callback = cb
    this.current = null
    this.parser = require('tap-parser')()
    this._attach(this.parser)
  }

  private _attach(parser: any) {
    parser.on('version', this._onVersion.bind(this))
    parser.on('comment', this._onComment.bind(this))
    parser.on('assert', this._onAssert.bind(this))
    parser.on('plan', this._onPlan.bind(this))
    parser.on('bailout', this._onBailout.bind(this))
    parser.on('child', this._onChild.bind(this))
    parser.on('extra', this._onExtra.bind(this))
    parser.on('complete', this._onComplete.bind(this))
  }

  _transform(chunk: Buffer, encoding: string, callback: (Error, Any) => void) {
    console.log('toTransform: ', chunk.toString())
    var ret = this.parser.write(chunk, encoding, callback)

  }

  _flush(cb) {
    if (!this.emittedSummary) {
      this.emit('summary', this.summary)
      this.emittedSummary = true
    }
    if (this.callback) {
      this.callback(null, this.summary)
      this.summary = null
    }
    cb()
  }

  private _error(error: Error) {
    if (this.callback) {
      this.callback(error)
    }
    this.emit('error', error)
    this.current = undefined
  }

  static _stripNewlines = /^\s+|\s+$/g
  private _onExtra(extra: string) {
    extra = extra.replace(NodeTapParser._stripNewlines, '')

    if (!this.current) {
      if (this.summary) {
        this.summary.extra.lines.push(extra)
      }
    } else {
      var appended = false
      if (this.current.items.length > 0) {
        const last = this.current.items[this.current.items.length - 1]
        if (last instanceof Log) {
          last.lines.push(extra)
          appended = true
        }
      }

      if (!appended) {
        this.current.items.push(new Log(extra))
      }
    }

    console.log('onExtra: ', extra)
  }

  private _onChild(childParser: any) {
    const self = this

    if (self.current) {
      // a child test, not a top-level test
      self.stack.push(self.current)
    }
    //we're entering a new test context
    self.current = new Test()

    this._attach(childParser)
  }

  private _onComplete(results: any) {
    this.current.success = results.ok
    this.current.asserts = results.count
    this.current.successfulAsserts = results.pass

    if (this.stack.length == 0) {
      // back at the top of the stack - just finished a top-level test
      this.push(this.current)
      this.current = null
    } else {
      // the test that just finished was a subtest of the last stack item
      const prev = this.stack.pop()
      prev.items.push(this.current)
      this.current = prev
    }
  }

  private _onBailout(reason: string) {
    console.log('onBailout: ', reason)
  }

  private _onPlan(plan: any) {
    console.log('onPlan: ', plan)
  }

  private _onAssert(assert: any) {
    if (this.current) {
      this.current.items.push(new Assert(assert.ok, assert.id, assert.name, assert.time))
    } else {
      // a top-level test result, add it to the summary
      this.summary.tests.push(new Assert(assert.ok, assert.id, assert.name, assert.time))
    }
  }

  private static _TestNameRegexp = /^# Subtest\:\s+(.*)$/im
  private static _TestTimeRegexp = /^# time=(.*)$/im
  private _onComment(comment: string) {
    console.log('onComment: ', comment)
    const testName = NodeTapParser._TestNameRegexp.exec(comment)

    if (testName) {
      this._onTestName(testName[1])
    } else {
      const testTime = NodeTapParser._TestTimeRegexp.exec(comment)
      if (testTime) {
        this._onTestTime(testTime[1])
      } else {
        comment = comment.replace(NodeTapParser._stripNewlines, '')
        this.current.items.push(new Comment(comment))
      }
    }
  }

  private _onTestName(testName: string) {
    this.current.name = testName
  }

  private _onTestTime(testTime: string) {
    if (this.current) {
      this.current.time = testTime
    } else if (!this.emittedSummary) {
      // the final line is the timing line
      this.summary.time = testTime
      this.emit('summary', this.summary)
      this.emittedSummary = true
    }
  }


  private _onVersion(version: number) {
    // start of a new run
    this.summary = new Summary()
    this.emittedSummary = false
    this.summary.version = version
  }
}

export default NodeTapParser
