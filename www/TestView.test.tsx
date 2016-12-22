import 'mocha'
import * as React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'

import { TestView } from './TestView'
import { Test, Plan, Assert } from '../src/parser/results'

var jsdom = require('mocha-jsdom')

describe('<TestView />', () => {

  jsdom()

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
      new Plan(0, 0),
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
      // no items
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
})
