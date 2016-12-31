import * as React from 'react'

import { TestRunList } from './TestRunList'
import { TestRun } from './client'

import { TestRunView } from './TestRunView'

export interface AppProps {
  store: TestRunList
}

export class App extends React.Component<AppProps, any> {

  private timeoutFullUpdate: number

  // background tasks
  fullUpdate() {
    const self = this
    this.props.store.update()
      .then(() => {
        console.log('finished update')
        self.setState({
          stdin: self.props.store.stdin.run
        },
          self.tickFullUpdate.bind(self))
      },
      error => {
        console.log('error getting full update', error)
      })
  }

  tickFullUpdate() {
    this.timeoutFullUpdate = setTimeout(this.fullUpdate.bind(this), 5000)
  }

  stopTasks() {
    clearTimeout(this.timeoutFullUpdate)
  }

  // lifecycle methods
  componentDidMount() {
    //start tasks
    this.tickFullUpdate()
  }

  componentWillUnmount() {
    this.stopTasks()
  }

  render() {
    var testRuns

    const stdin = this.props.store.stdin
    if (stdin && stdin.run) {
      testRuns = this.renderTestRun(stdin.source, stdin.run)
    } else {
      testRuns = <h3>Waiting on input from stdin...</h3>
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
