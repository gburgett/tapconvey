import { Summary, Test } from '../src/parser/results'
import { NodeTapParser } from '../src/parser'
import * as express from 'express'
import * as http from 'http'
import { Writable, Readable } from 'stream'

import { TestRun } from './client'


const requestLogger: express.RequestHandler = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  console.info(`${(new Date()).toUTCString()}|${request.method}|${request.url}|${request.ip}`);
  next();
}

class ServerWritable extends Writable {
  private readonly server: Server
  readonly source: string

  constructor(server: Server, source: string) {
    super({
      objectMode: true
    })
    this.server = server
    this.source = source
  }

  _write(chunk, encoding, callback) {
    if (chunk instanceof Test) {
      this.server.pushTests(this.source, chunk)
    } else if (chunk instanceof Summary) {
      this.server.pushSummary(this.source, chunk)
    } else if (typeof (chunk) === 'number') {
      this.server.pushNewTestRun(this.source)
    } else {
      callback(new Error(`unkown written object type ${typeof (chunk)} - ${chunk}`))
      return
    }

    callback()
  }

}


export class Server {
  private readonly testRuns = new Map<string, TestRun>()

  constructor() {
  }

  public init(app: express.Application) {
    app.use(requestLogger)
    var routes = express.Router()
    app.use('/api', routes)

    const self = this
    routes.get('/allRuns', (req, res, next) => {
      const ret = JSON.stringify(self._getAllTestRuns())
      res.contentType('application/json')
      res.write(ret)
      res.end()
    })
  }

  public writeableSource(source: string): Writable {
    return new ServerWritable(this, source)
  }

  // Public push data

  public pushTests(source: string, ...tests: Test[]) {
    if (!this.testRuns.has(source)) {
      this.pushNewTestRun(source)
    }
    this.testRuns.get(source).tests.push(...tests)
  }

  public pushSummary(source: string, summary: Summary) {
    if (!this.testRuns.has(source)) {
      this.pushNewTestRun(source)
    }
    this.testRuns.get(source).summary = summary
  }

  public pushNewTestRun(source: string) {
    this.testRuns.set(source, new TestRun())
  }

  // Handler methods

  private _getAllTestRuns(): Array<[string, TestRun]> {
    return [...this.testRuns]
  }

}
