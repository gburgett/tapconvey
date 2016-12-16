import * as request from 'request'
import * as Results from '../src/parser/results'

export class TestRun {
  public summary: Results.Summary
  public tests: Results.Test[] = []
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

  public async getAllRuns(): Promise<Map<string, TestRun>> {
    const self = this
    const url = self.url + '/allRuns'
    return new Promise<Map<string, TestRun>>((resolve, reject) => {
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
              const json: Array<any> = JSON.parse(body)
              const ret = new Map<string, TestRun>()
              json.forEach(obj => {
                const run = new TestRun()
                run.summary = Results.Summary.deserialize(obj[1].summary)
                run.tests = obj[1].tests.map(Results.Test.deserialize)
                ret.set(obj[0], run)
              })

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
