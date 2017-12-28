import 'mocha'
import * as React from 'react'
import { shallow, mount } from 'enzyme'
import { expect, use } from 'chai'
import * as chaiEnzyme from 'chai-enzyme'
use(chaiEnzyme())
import { asMap } from 'mobx'
import * as sinon from 'sinon'

import { App, TIMEOUTS } from './app'
import { TestRunList } from './TestRunList'
import { TestRun } from './client'
import { Summary } from '../lib/parser/results'

describe('<App />', () => {

  describe('single run from stdin', () => {
    const run = new TestRun()
    run.summary = new Summary()
    run.summary.version = 13
    run.summary.time = '245ms'

    it('renders the Overall component', () => {
      const mock = new TestRunList(undefined)
      const app = shallow(<App store={mock} />)

      expect(app.find('Overall').length).to.equal(1)
    })

    it('renders a TestRunView with the test run', () => {
      const mock = new TestRunList(undefined, asMap<TestRun>({
        'stdin': run
      }))
      const app = shallow(<App store={mock} />)

      const view = app.find('TestRunView')
      expect(view).to.have.prop('run').equal(run)
      expect(view).to.have.prop('source').equal('stdin')
      expect(view.key()).to.equal('stdin')
    })
  })

  describe('fullUpdate background task', () => {
    TIMEOUTS.full_update = 50
    const fakeRun = new TestRun()
    fakeRun.summary = new Summary()
    fakeRun.summary.version = 13
    fakeRun.summary.time = '245ms'

    it('starts on componentDidMount', () => {
      const list: any = {
        update: function () { return Promise.resolve() },
        stdin: undefined
      }
      const spy = sinon.spy(list, 'update')

      // act
      const app = mount(<App store={list} />)
      after(() => app.unmount())

      expect(spy.called).to.be.true
      app.unmount()
    })

    it('ticks every timeout', (done) => {
      const list: any = {
        update: function () { return Promise.resolve() },
        stdin: undefined
      }
      const spy = sinon.spy(list, 'update')

      // act
      const app = mount(<App store={list} />)
      setTimeout(() => {
        app.unmount()

        expect(spy.calledTwice).to.be.true

        done()
      }, TIMEOUTS.full_update * 1.2)
    })

    it('stops on componentWillUnmount', (done) => {
      const list: any = {
        update: function () { return Promise.resolve() },
        stdin: undefined
      }
      const spy = sinon.spy(list, 'update')

      // act
      const app = mount(<App store={list} />)
      setTimeout(() => {
        app.unmount()
      }, TIMEOUTS.full_update * 1.2)

      setTimeout(() => {
        expect(spy.calledTwice).to.be.true
        expect(spy.calledThrice).to.be.false

        done()
      }, TIMEOUTS.full_update * 2.2)
    })
  })
})