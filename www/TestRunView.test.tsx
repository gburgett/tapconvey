import 'mocha'
import * as React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'

import { TestRunView } from './TestRunView'
import { TestRun } from './client'
import { Summary, Test, Plan, Assert } from '../src/parser/results'

describe('<TestRunView />', () => {

  describe('run with no tests', () => {
    const run = new TestRun()
    run.summary = new Summary()
    run.summary.version = 13
    run.summary.time = '123ms'

    it('should render header', () => {
      //act
      const instance = shallow(<TestRunView source='test.js' run={run} />)

      const header = instance.find('.test-header')
      expect(header.text()).to.include('test.js')
      expect(header.text()).to.include('0 / 0')
    })

    it('should render with test-incomplete class', () => {
      //act
      const instance = shallow(<TestRunView source='test.js' run={run} />)

      const header = instance.find('.test-header')
      expect(header.hasClass('test-incomplete')).to.be.true
    })
  })

  describe('run with one successful test', () => {
    const run = new TestRun()
    run.summary = new Summary()
    run.summary.version = 13
    run.summary.time = '123ms'
    run.summary.tests = [
      new Assert(true, 1, 'test 1', 120)
    ]
    run.tests = [
      new Test(
        1,
        'test 1',
        true,
        1,
        1,
        '120ms',
        new Plan(0, 1),
        [],
        new Assert(true, 1, 'assert 1')
      )
    ]

    it('should render header', () => {
      //act
      const instance = shallow(<TestRunView source='test.js' run={run} />)

      const header = instance.find('.test-header')
      expect(header.text()).to.include('test.js')
      expect(header.text()).to.include('1 / 1')
    })

    it('should render with test-success class', () => {
      //act
      const instance = shallow(<TestRunView source='test.js' run={run} />)

      const header = instance.find('.test-header')
      expect(header.hasClass('test-success')).to.be.true
    })

    it('should render a TestView with key test-1', () => {
      //act
      const instance = shallow(<TestRunView source='test.js' run={run} />)

      const testView = instance.find('.test-list TestView')
      expect(testView).to.have.length(1)
      expect(testView.key()).to.equal('test-1')
    })
  })

  describe('run with one failing test', () => {
    const run = new TestRun()
    run.summary = new Summary()
    run.summary.version = 13
    run.summary.time = '123ms'
    run.summary.tests = [
      new Assert(false, 1, 'test 1', 120)
    ]
    run.tests = [
      new Test(
        1,
        'test 1',
        false,
        1,
        0,
        '120ms',
        new Plan(0, 1),
        [],
        new Assert(false, 1, 'assert 1')
      )
    ]

    it('should render header', () => {
      //act
      const instance = shallow(<TestRunView source='test.js' run={run} />)

      const header = instance.find('.test-header')
      expect(header.text()).to.include('test.js')
      expect(header.text()).to.include('0 / 1')
    })

    it('should render with test-fail class', () => {
      //act
      const instance = shallow(<TestRunView source='test.js' run={run} />)

      const header = instance.find('.test-header')
      expect(header.hasClass('test-fail')).to.be.true
    })

    it('should render a TestView with key test-1', () => {
      //act
      const instance = shallow(<TestRunView source='test.js' run={run} />)

      const testView = instance.find('.test-list TestView')
      expect(testView).to.have.length(1)
      expect(testView.key()).to.equal('test-1')
    })
  })

  describe('run with multiple tests', () => {
    const run = new TestRun()
    run.summary = new Summary()
    run.summary.version = 13
    run.summary.time = '245ms'
    run.summary.tests = [
      new Assert(true, 1, 'test 1', 120),
      new Assert(false, 2, 'test 2', 120)
    ]
    run.tests = [
      new Test(
        1,
        'test 1',
        true,
        1,
        1,
        '120ms',
        new Plan(0, 1),
        [],
        new Assert(true, 1, 'assert 1')
      ),
      new Test(
        2,
        'test 2',
        false,
        1,
        0,
        '120ms',
        new Plan(0, 1),
        [],
        new Assert(false, 1, 'assert 2')
      )
    ]

    it('should render header', () => {
      //act
      const instance = shallow(<TestRunView source='test.js' run={run} />)

      const header = instance.find('.test-header')
      expect(header.text()).to.include('test.js')
      expect(header.text()).to.include('1 / 2')
    })

    it('should render two TestViews with appropriate keys', () => {
      //act
      const instance = shallow(<TestRunView source='test.js' run={run} />)

      const testView = instance.find('.test-list TestView')
      expect(testView).to.have.length(2)

      expect(testView.at(0).key()).to.equal('test-1')
      expect(testView.at(1).key()).to.equal('test-2')
    })
  })

})
