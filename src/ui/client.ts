
import * as Results from '../lib/parser/results'
import * as debug from 'debug'

const d = debug('tc:client.ts')

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
    return fetch(url)
      .then((response) => {
        return response.json().then((body) => {
          d('GET %s\n\t%o', url, response)

          if (Object.keys(body).length === 0) {
            return null
          }

          const ret = new Map<string, TestRun>()
          body.forEach(obj => {
            const run = new TestRun()
            run.summary = Results.Summary.deserialize(obj[1].summary)
            run.tests = obj[1].tests.map(Results.Test.deserialize)
            ret.set(obj[0], run)
          })

          return ret
        })
      })
  }


}
