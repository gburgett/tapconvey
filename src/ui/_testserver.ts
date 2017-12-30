/*
 * _testserver.ts: utility exposing test data as an API for use in tests
 *   ignored by Istanbul
 */

import { Writable, Readable } from 'stream'

import { Summary, Test } from '../lib/parser/results'
import { NodeTapParser } from '../lib/parser'
import { TestRun } from './client'

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

  public getAllTestRuns(): Array<[string, TestRun]> {
    return [...this.testRuns]
  }

}
