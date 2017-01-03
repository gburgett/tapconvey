import * as React from 'react'
import * as yaml from 'js-yaml'

import { Assert } from '../src/parser/results'

const styles = require('./AssertView.scss')

export class AssertView extends React.Component<{ assert: Assert }, undefined> {
  render() {
    const {assert} = this.props
    var css = 'assert-fail'
    if (assert.success) {
      css = 'assert-success'
    }

    var timing
    if (assert.time) {
      timing = (
        <span className={'timing ' + (assert.time > 1000 ? 'timing-long' : '')}>
          ({assert.time}ms)
        </span>
      )
    }

    var data
    if (assert.data) {
      data = (<pre>
        {yaml.safeDump(assert.data, {
          skipInvalid: true
        })}
      </pre>)
    }

    return (<div className={'assert ' + css}>
      <div className='assert-header'>
        <span className='assert-icon'></span>
        <span className='assert-comment'>{this.props.assert.comment}</span>
        {timing}
      </div>
      <div className='assert-body'>
        {data}
      </div>
    </div>)
  }
}
