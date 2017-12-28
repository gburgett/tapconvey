import * as React from 'react'

import { Summary } from '../lib/parser/results'

const styles = require('./overall.scss')

export interface OverallProps {
  summary: Summary
}

export class Overall extends React.Component<OverallProps, any> {
  render() {
    if (!this.props.summary) {
      return (
        <div className='overall overall-waiting'>
          <div className='status'>Running tests...</div>
        </div>
      )
    }
    const { bailout, tests, time } = this.props.summary

    var css = 'overall-fail'
    var success = 'FAIL'
    var bailoutMsg
    if (bailout) {
      css = 'overall-bailout'
      success = 'BAILOUT'
      bailoutMsg = (<h3>{bailout}</h3>)
    } else if (tests.every(t => t.success)) {
      css = 'overall-pass'
      success = 'PASS'
    }

    return (
      <header>
        <div className={'overall ' + css}>
          <div className='status'>{success}</div>
        </div>
        <div className='summary'>
          <span className='logo'>Tapconvey</span>
          <span>{bailoutMsg}
            {tests.filter(t => t.success).length} / {tests.length} succeeded in {time}</span>
        </div>
      </header>
    )
  }

}

export default Overall