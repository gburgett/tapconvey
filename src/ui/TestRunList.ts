import { observable, computed, ObservableMap, asMap } from 'mobx'
import { TestRun, Client } from './client'

export class TestRunList {
  @observable public readonly testRuns: ObservableMap<TestRun>

  private client: Client

  /* gets the test run from STDIN, which overrides all other runs */
  @computed get stdin(): { source: string, run: TestRun } {
    const run = this.testRuns.get('stdin')
    if (run) {
      return {
        source: 'stdin',
        run: run
      }
    }
    return undefined
  }

  constructor(client: Client, runs?: ObservableMap<TestRun>) {
    this.client = client
    this.testRuns = runs || asMap()
  }

  public async update(): Promise<void> {
    const self = this
    const allRuns = await self.client.getAllRuns()
    allRuns.forEach((test, source) => {
      self.testRuns.set(source, test)
    })
  }

}
