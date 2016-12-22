import * as React from 'react'
import { observer } from 'mobx-react'

import { Test, ResultItem } from '../src/parser/results'

@observer
export class TestView extends React.Component<{ test: Test }, undefined> {


  render() {
    const {test} = this.props

    var headerDesc = (<span>
      {test.successfulAsserts} / {test.asserts} asserts succeded ({test.time})
    </span>)
    if (test.bailout) {
      headerDesc = (<span>{test.bailout}</span>)
    }

    var className = 'test-fail'
    if (test.bailout) {
      className = 'test-bailout'
    } else if (test.success) {
      className = 'test-success'
    }

    var bailout
    if (test.bailout) {
      bailout = (<div className='bailout-msg'>
        {test.bailout}
      </div>)
    }

    return (<div className={'test-view ' + className}>
      <div className='test-header'>
        <h4>{`${test.id}: ${test.name}`}</h4><br />
        {headerDesc}
      </div>
      <div>
        {test.items.map(this.renderItem)}
      </div>
      {bailout}
    </div>)
  }

  renderItem(item: ResultItem) {
    switch (item.__type__) {

      default:
        return (<pre>{JSON.stringify(item)}</pre>)
    }

    // throw new Error('should be unreachable')
  }
}
