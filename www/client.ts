import * as request from 'superagent'
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

export interface Client {
  getAllRuns(): Promise<Map<string, TestRun>>
}

export class ClientImpl {
  readonly url: string

  constructor(url: string) {
    this.url = url
  }

  public async getAllRuns(): Promise<Map<string, TestRun>> {
    const self = this
    const url = self.url + '/allRuns'
    return new Promise<Map<string, TestRun>>((resolve, reject) => {
      request
        .get(url)
        .end((error, response) => {
          if (error) {
            reject(error)
          } else if (response.status < 200 || response.status >= 300) {
            reject(new RequestError(`GET ${url}: ${response.status}`, response))
          } else {
            var body

            if (Object.keys(response.body).length === 0 && response.text.length > 0) {
              try {
                body = JSON.parse(response.text)
              } catch (e) {
                reject(e)
                return
              }
            } else {
              body = response.body
            }

            if (Object.keys(response.body).length === 0) {
              resolve(null)
              return
            }

            const ret = new Map<string, TestRun>()
            body.forEach(obj => {
              const run = new TestRun()
              run.summary = Results.Summary.deserialize(obj[1].summary)
              run.tests = obj[1].tests.map(Results.Test.deserialize)
              ret.set(obj[0], run)
            })

            resolve(ret)
          }
        })
    })
  }


}
