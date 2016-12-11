import { Summary, Test } from '../src/parser/results'
import * as express from 'express'
import * as http from 'http'

class TestRun {
  public summary: Summary
  public tests: Test[]
}


const requestLogger: express.RequestHandler = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  console.info(`${(new Date()).toUTCString()}|${request.method}|${request.url}|${request.ip}`);
  next();
}


export class Server {
  private lastRun: TestRun

  readonly app: express.Application
  private runningServer: http.Server

  constructor(app?: express.Application) {
    this.app = app || express()
    this.app.use(requestLogger)
    var routes = express.Router()
    this._init(routes)
    this.app.use('/api', routes)
  }

  private _init(routes: express.Router) {
    const self = this
    routes.get('/lastRun', (req, res, next) => {
      res.write(self._getLastRun())
    })
  }

  public listen(port: string | number) {
    this.runningServer = this.app.listen(port)
  }

  public close() {
    this.runningServer.close()
    this.runningServer = null
  }

  // Public push data

  public pushTests(...tests: Test[]) {
    if (!this.lastRun) {
      this.lastRun = new TestRun()
    }
    this.lastRun.tests.push(...tests)
  }

  public pushSummary(summary: Summary) {
    if (!this.lastRun) {
      this.lastRun = new TestRun()
    }
    this.lastRun.summary = summary
  }

  public pushNewTestRun() {
    this.lastRun = new TestRun()
  }

  // Handler methods

  private _getLastRun(): TestRun {
    return this.lastRun
  }
}
