import * as React from 'react'
import { expect } from 'chai'

import { configure, shallow } from 'enzyme'
const Adapter = require('enzyme-adapter-react-15')
configure({ adapter: new Adapter() })

import { TestView } from './TestView'
import { Test, Plan, Assert } from '../lib/parser/results'

describe('<TestView />', () => {

  describe('test with no items', () => {
    it('renders the header message', () => {
      const test = new Test(
        1,
        'fake test',
        true,
        0,
        0,
        '123ms',
        new Plan(0, 0),
        // no items
      )

      //act
      const view = shallow(<TestView test={test} />)

      expect(view.find('h4').text()).to.contain('1:')
      expect(view.find('h4').text()).to.contain('fake test')
      const headerText = view.find('.test-header div span').text()
      expect(headerText).to.contain('0 / 0')
      expect(headerText).to.contain('123ms')
    })
  })

  describe('successful test with one successful assert', () => {
    const test = new Test(
      1,
      'fake test',
      true,
      1,
      1,
      '123ms',
      new Plan(1, 1),
      [],
      new Assert(
        true,
        1,
        'fake assert'
      )
    )

    it('renders the header message', () => {
      //act
      const view = shallow(<TestView test={test} />)

      const headerText = view.find('.test-header div span').text()
      expect(headerText).to.contain('1 / 1')
    })

    it('renders the assert view', () => {
      //act
      const view = shallow(<TestView test={test} />)

      const assert = view.find('AssertView')
      expect(assert).to.have.length(1)
      expect(assert.prop('assert')).to.equal(test.items[0], 'assert property')
    })

    it('renders with the test-success class', () => {
      //act
      const view = shallow(<TestView test={test} />)

      const root = view.find('.test-view')
      expect(root.hasClass('test-success')).to.be.true
      expect(root.hasClass('test-fail')).to.be.false
      expect(root.hasClass('test-bailout')).to.be.false
    })
  })

  describe('unsuccessful test with one failed assert', () => {
    const test = new Test(
      1,
      'fake test',
      false,
      1,
      0,
      '123ms',
      new Plan(0, 1),
      [],
      new Assert(
        false,
        1,
        'fake assert'
      )
    )

    it('renders the header message', () => {
      //act
      const view = shallow(<TestView test={test} />)

      const headerText = view.find('.test-header div span').text()
      expect(headerText).to.contain('0 / 1')
    })

    it('renders with the test-fail class', () => {

      //act
      const view = shallow(<TestView test={test} />)

      const root = view.find('.test-view')
      expect(root.hasClass('test-success')).to.be.false
      expect(root.hasClass('test-fail')).to.be.true
      expect(root.hasClass('test-bailout')).to.be.false
    })
  })

  describe('unsuccessful test with bailout', () => {
    const test = new Test(
      1,
      'fake test',
      false,
      1,
      0,
      '123ms',
      new Plan(0, 1),
      //bailout before first assert
    )
    test.bailout = 'test bail out'

    it('renders the header message', () => {
      //act
      const view = shallow(<TestView test={test} />)

      const headerText = view.find('.test-header div span').text()
      expect(headerText).to.contain('test bail out')
    })

    it('renders with the test-fail class', () => {

      //act
      const view = shallow(<TestView test={test} />)

      const root = view.find('.test-view')
      expect(root.hasClass('test-success')).to.be.false
      expect(root.hasClass('test-fail')).to.be.false
      expect(root.hasClass('test-bailout')).to.be.true
    })
  })

  describe('successful test with one subtest', () => {
    const test = new Test(
      1,
      'fake test',
      true,
      1,
      1,
      '123ms',
      new Plan(0, 1),
      [],
      new Test(
        1,
        'subtest 1',
        true,
        1,
        1,
        '100ms',
        new Plan(0, 1),
        ['fake test'],
        new Assert(
          true,
          1,
          'assert 1'
        )
      ),
      new Assert(
        true,
        2,
        'subtest 1'
      )
    )

    it('renders the header message', () => {
      //act
      const view = shallow(<TestView test={test} />)

      const headerText = view.find('.test-header div').text()
      expect(headerText).to.contain('fake test')
      expect(headerText).to.contain('1 / 1')
    })

    it('renders an inner test-view', () => {
      //act
      const view = shallow(<TestView test={test} />)
      const inner = view.find('TestView')

      expect(inner.length).to.equal(1)
    })

    it('renders inner test-view header', () => {
      //act
      const view = shallow(<TestView test={test} />)
      const inner = view.find('TestView').dive()

      const headerText = inner.find('.test-header').text()
      expect(headerText).to.contain('subtest 1')
      expect(headerText).to.contain('1 / 1')
    })

    it('renders inner test-view with key equal to test id', () => {
      //act
      const view = shallow(<TestView test={test} />)
      const inner = view.find('TestView')

      expect(inner.key()).to.equal('test-1')
    })
  })
})
