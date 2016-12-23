import * as React from 'react'

import { TestRunList } from './TestRunList'
import { TestRun } from './client'

import { TestRunView } from './TestRunView'

export interface AppProps {
  runs: TestRunList
}

export class App extends React.Component<AppProps, undefined> {
  render() {
    var testRuns

    const stdin = this.props.runs.stdin
    if (stdin && stdin.run) {
      testRuns = this.renderTestRun(stdin.source, stdin.run)
    } else {
      testRuns = <h3>Runs from other sources not implemented yet</h3>
    }

    return (
      <div>
        <div>
          <h2>Tapconvey</h2>
        </div>
        <div>
          {testRuns}
        </div>
      </div>
    )
  }

  renderTestRun(source: string, run: TestRun) {

    return (
      <TestRunView source={source} run={run} key={source} />
    )
  }
}
