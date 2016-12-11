import * as request from 'request'
import * as Results from '../src/parser/results'

export class TestRun {
  public summary: Results.Summary
  public tests: Results.Test[]
}

export class RequestError extends Error {
  public readonly name = 'RequestError'
  public readonly response: any

  constructor(message: string, response: any) {
    super(message)
    this.response = response
  }
}

export class Client {
  readonly url: string

  constructor(url: string) {
    this.url = url
  }

  public async getLastRun(): Promise<TestRun> {
    const self = this
    const url = self.url + '/lastRun'
    return new Promise<TestRun>((resolve, reject) => {
      request(url, (error, response, body) => {
        if (error) {
          reject(error)
        } else if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new RequestError(`GET ${url}: ${response.statusCode}`, response))
        } else {
          if (!body || body.length == 0) {
            resolve(null)
          } else {
            try {
              const json = JSON.parse(body)

              const ret = new TestRun()
              ret.summary = Results.Summary.deserialize(json.summary)
              ret.tests = json.tests.map(Results.Test.deserialize)
              resolve(ret)
            } catch (e) {
              reject(e)
            }
          }
        }
      })
    })
  }


}
