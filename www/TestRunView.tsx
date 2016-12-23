import * as React from 'react'
import { observer } from 'mobx-react'

import { TestRun } from './client'

import { TestView } from './TestView'

@observer
export class TestRunView extends React.Component<{ source: string, run: TestRun }, undefined> {

  constructor() {
    super()
  }

  render() {
    const { run, source } = this.props

    var className = 'test-success'
    if (run.summary.bailout) {
      className = 'test-bailout'
    } else if (run.summary.tests.length == 0) {
      className = 'test-incomplete'
    } else if (run.summary.tests.some(t => !t.success)) {
      className = 'test-fail'
    }

    const numSuccess = run.summary.tests.reduce((c, t) => t.success ? c + 1 : c, 0)

    var headerDesc = (<span>
      {numSuccess} / {run.summary.tests.length} tests succeded
    </span>)
    if (run.summary.bailout) {
      headerDesc = (<span>{run.summary.bailout}</span>)
    }

    return (
      <div className='test'>
        <div className={'test-header ' + className}>
          <h2>{source}</h2><br />
          {headerDesc}
        </div>
        <div className='test-list'>
          {run.tests.map(t =>
            <TestView test={t} key={'test-' + t.id} />
          )}
        </div>
      </div>
    )
  }
}
