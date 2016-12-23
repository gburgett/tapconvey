import 'mocha'
import * as React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'
import { asMap } from 'mobx'

import { App } from './app'
import { TestRunList } from './TestRunList'
import { TestRun } from './client'
import { Summary } from '../src/parser/results'

var jsdom = require('mocha-jsdom')

describe('<App />', () => {

  jsdom()

  describe('single run from stdin', () => {
    const run = new TestRun()
    run.summary = new Summary()
    run.summary.version = 13
    run.summary.time = '245ms'

    it('renders the header message', () => {
      const mock = new TestRunList(undefined)
      const app = shallow(<App runs={mock} />)

      expect(app.find('h2').text()).to.equal('Tapconvey')
    })

    it('renders a TestRunView with the test run', () => {
      const mock = new TestRunList(undefined, asMap<TestRun>({
        'stdin': run
      }))
      const app = shallow(<App runs={mock} />)

      const view = app.find('TestRunView')
      expect(view.prop('run')).to.equal(run)
      expect(view.prop('source')).to.equal('stdin')
      expect(view.key()).to.equal('stdin')
    })
  })
})
