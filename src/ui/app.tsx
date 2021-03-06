import * as React from 'react'

import { TestRunList } from './TestRunList'
import { TestRun } from './client'

import { TestRunView } from './TestRunView'
import { Overall } from './overall'

const styles = require('./app.scss')

export var TIMEOUTS = {
  full_update: 1000
}

export interface AppProps {
  store: TestRunList
}

export class App extends React.Component<AppProps, any> {

  private timeoutFullUpdate: number

  // background tasks
  fullUpdate() {
    console.log('fullUpdate')
    const self = this
    const store = self.props.store
    store.update().then(() => {
      self.setState({
        stdin: store.stdin ? store.stdin.run : undefined
      },
        self.tickFullUpdate.bind(self))
    },
      error => {
        console.log('error getting full update', error)
      })
  }

  tickFullUpdate() {
    this.timeoutFullUpdate = setTimeout(this.fullUpdate.bind(this), TIMEOUTS.full_update)
  }

  stopTasks() {
    clearTimeout(this.timeoutFullUpdate)
  }

  // lifecycle methods
  componentDidMount() {
    //start tasks
    this.fullUpdate()
  }

  componentWillUnmount() {
    this.stopTasks()
  }

  render() {
    var testRuns

    const stdin = this.props.store.stdin
    if (stdin && stdin.run) {
      testRuns = this.renderTestRun(stdin.source, stdin.run)
    }

    const summary = stdin
      ? stdin.run.summary
      : undefined

    return (
      <div>
        <Overall summary={summary} />
        <div className='frame'>
          <div className='col'>
            {testRuns}
          </div>
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
