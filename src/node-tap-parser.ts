import { Transform } from 'stream'
import { Results, Test, Assert, Comment } from './results'

/*
  Transform a stream of TAP formatted input
  into a Results object.
*/
export class NodeTapParser extends Transform {
  private current: Test
  private parser: any
  private isChild: boolean
  private callback

  constructor(cb?: (error: Error) => void, parser?: any, isChild?: boolean) {
    super({
      readableObjectMode: true,
      writableObjectMode: false
    })

    this.callback = cb
    this.current = isChild ? new Test() : null
    this.parser = parser || require('tap-parser')()
    this.isChild = isChild
    this.parser.on('version', this._onVersion.bind(this))
    this.parser.on('comment', this._onComment.bind(this))
    this.parser.on('assert', this._onAssert.bind(this))
    this.parser.on('plan', this._onPlan.bind(this))
    this.parser.on('bailout', this._onBailout.bind(this))
    this.parser.on('child', this._onChild.bind(this))
    this.parser.on('extra', this._onExtra.bind(this))
    this.parser.on('complete', this._onComplete.bind(this))
    this.parser.on('end', this._onComplete.bind(this))
  }

  _transform(chunk: Buffer, encoding: string, callback: (Error, Any) => void) {
    console.log('toTransform: ', chunk.toString())
    var ret = this.parser.write(chunk, encoding, callback)

  }

  _flush(cb) {
    if (this.callback) {
      this.callback(null, this.current)
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

  private _onExtra(extra: string) {
    console.log('onExtra: ', extra)
  }

  private _currentChildParser
  private _onChild(childParser: any) {
    console.log('onChild - spawning new parser')
    const self = this
    this._currentChildParser = new NodeTapParser((error: Error) => {
      if (error) {
        console.log('child error: ', error)
        this._error(error)
      }
      console.log('child parser finished')
      self._currentChildParser = undefined
    },
      childParser,
      true)
    this._currentChildParser.on('data', this._onChildTest.bind(this))
  }

  private _onChildTest(child: Test) {
    console.log('child parser sent test: ', child.name)
    if (this.isChild) {
      this.current.items.push(child)
    } else {
      //top level parser pushes out child tests as it gets them
      this.push(child)
    }
  }

  private _onBailout(reason: string) {
    console.log('onBailout: ', reason)
  }

  private _onPlan(plan: any) {
    console.log('onPlan: ', plan)
  }

  private _onAssert(assert: any) {
    this.current.items.push(new Assert(assert.ok, assert.id, assert.name))
    console.log('onAssert: ', assert)
  }

  private static _TestNameRegexp = /^# Subtest\:\s+(.*)$/im
  private static _TestTimeRegexp = /^# time=(.*)$/im
  private _onComment(comment: string) {
    const testName = NodeTapParser._TestNameRegexp.exec(comment)

    if (testName) {
      this.current.name = testName[1]
    } else {
      const testTime = NodeTapParser._TestTimeRegexp.exec(comment)
      if (testTime) {
        this.current.time = testTime[1]
      } else {
        this.current.items.push(new Comment(comment))
      }
    }
    console.log('onComment: ', comment)
  }

  private _onVersion(version: string) {
    this.emit('version', version)
    console.log('onVersion: ', version)
  }

  private _onComplete(results: any) {
    console.log('onComplete ', results)
    this.current.success = results.ok
    this.current.asserts = results.count
    this.current.successfulAsserts = results.pass
    this.push(this.current)
    this.current = new Test()
  }
}

export default NodeTapParser
