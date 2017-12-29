import { Transform } from 'stream'
import { Summary, Test, Plan, Assert, Comment, Log } from './results'

const debug = require('debug')('tapconvey:parser')

/*
  Transform a stream of TAP formatted input
  into a Results object.
*/
export class NodeTapParser extends Transform {
  private current: Test
  private toFinalize: Test
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
    var ret = this.parser.write(chunk, encoding, callback)

  }

  _flush(cb) {
    this._doFlush()
    cb()
  }

  private _doFlush() {
    if (!this.emittedSummary) {
      if (this.summary) {
        this.push(this.summary)
        this.emit('summary', this.summary)
      }
      if (this.callback) {
        this.callback(null, this.summary)
        this.summary = null
      }
      this.emittedSummary = true
    }
  }

  private _pushFinalized() {
    if (this.stack.length == 0 && this.current == null) {
      this.push(this.toFinalize)
    }
    this.toFinalize = null
  }

  private _error(error: Error) {
    this.emit('error', error)
    this._doFlush()
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
        this.current.items.push(new Log([extra]))
      }
    }
  }

  private _onChild(childParser: any) {
    const self = this

    if (this.toFinalize) {
      // never got a finalization assert, push what we got
      this._pushFinalized()
    }

    const path = []
    if (self.current) {
      // a child test, not a top-level test.
      // push it to the stack and set the path on the new test.
      self.stack.push(self.current)
      path.push(...self.current.path, self.current.name)
    }
    //we're entering a new test context
    self.current = new Test()
    self.current.path = path

    this._attach(childParser)
  }

  private _onComplete(results: any) {
    if (!this.current) {
      return
    }
    this.current.success = results.ok
    this.current.asserts = results.count
    this.current.successfulAsserts = results.pass
    if (results.bailout) {
      this.current.bailout = results.bailout
    }

    // test isn't done yet, expecting a final assert to sum it up
    this.toFinalize = this.current

    if (this.stack.length == 0) {
      // back at the top of the stack - just finished a top-level test
      if (results.bailout) {
        this.summary.bailout = results.bailout
        this.summary.tests.push(new Assert(false, -1, this.current.name))
      }
      this.current = null
    } else {
      // the test that just finished was a subtest of the last stack item
      const prev = this.stack.pop()
      prev.items.push(this.current)
      if (results.bailout) {
        prev.items.push(new Assert(false, -1, this.current.name))
      }
      this.current = prev
    }
  }

  private _onBailout(reason: string) {
    if (this.toFinalize) {
      // no finalization asserts if we're bailing out - it all just pops up the stack
      this._pushFinalized()
    }

    if (!this.current) {
      // we followed the bailout to the top of the stack,
      // finish the process
      this._doFlush()
    }
  }

  private _onPlan(plan: any) {
    if (this.current) {
      this.current.plan = new Plan(plan.start, plan.end)
    }
  }

  private _onAssert(assert: any) {
    const toAdd = new Assert(assert.ok, assert.id, assert.name, assert.time)
    if (assert.diag) {
      toAdd.data = assert.diag
    }

    if (this.toFinalize) {
      // this assert is a summary of the previous test.  Copy some authoritative info.
      this.toFinalize.id = toAdd.id,
        this.toFinalize.name = toAdd.comment
      if (toAdd.time) {
        this.toFinalize.time = toAdd.time.toString() + 'ms'
      }
      this._pushFinalized()
    }

    if (this.current) {
      this.current.items.push(toAdd)
    } else {
      // a top-level test result, add it to the summary
      this.summary.tests.push(toAdd)
    }
  }

  private static _TestNameRegexp = /^# Subtest\:\s+(.*)$/im
  private static _TestTimeRegexp = /^# time=(.*)$/im
  private _onComment(comment: string) {
    const testName = NodeTapParser._TestNameRegexp.exec(comment)

    if (testName) {
      this._onTestName(testName[1])
    } else {
      const testTime = NodeTapParser._TestTimeRegexp.exec(comment)
      if (testTime) {
        this._onTestTime(testTime[1])
      } else {
        comment = comment.replace(NodeTapParser._stripNewlines, '')
        if (this.current) {
          this.current.items.push(new Comment(comment))
        } else {
          this.summary.extra.lines.push(comment)
        }
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
      this._doFlush()
    }
  }


  private _onVersion(version: number) {
    // start of a new run
    this.summary = new Summary()
    this.emittedSummary = false
    this.summary.version = version
    this.emit('start', version)
    this.push(version)
  }
}

export default NodeTapParser
