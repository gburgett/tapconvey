import 'mocha'
import * as React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'

import { AssertView } from './AssertView'
import { Test, Plan, Assert } from '../src/parser/results'

describe('<AssertView />', function () {

  describe('successful assert', function () {

    const assert = new Assert(
      true,
      1,
      'this is the assert comment'
    )

    assert.data = {
      some: 'data',
      deep: {
        array: [
          '1',
          '2',
          '3'
        ]
      }
    }

    it('should render a header', () => {

      //act
      const rendered = shallow(<AssertView assert={assert} />)

      //assert
      const comment = rendered.find('.assert-comment')
      expect(comment.text()).to.contain('this is the assert comment')
    })

    it('should render with assert-success css class', () => {

      //act
      const rendered = shallow(<AssertView assert={assert} />)

      //assert
      const outer = rendered.find('.assert')
      expect(outer.hasClass('assert-success')).to.be.true

    })

    it('should render associated data', () => {

      //act
      const rendered = shallow(<AssertView assert={assert} />)

      //assert
      const data = rendered.find('.assert-body')
      expect(data.text()).to.contain('some:')
      expect(data.text()).to.contain('data')
      expect(data.text()).to.contain('\'1\'')
    })
  })

  describe('failed assert', function () {
    const assert = new Assert(
      false,
      1,
      'this is the assert comment'
    )

    it('should render with assert-fail css class', () => {

      //act
      const rendered = shallow(<AssertView assert={assert} />)

      //assert
      const outer = rendered.find('.assert')
      expect(outer.hasClass('assert-fail')).to.be.true
    })
  })

  describe('assert with timing info', function () {
    const assert = new Assert(
      false,
      1,
      'this is the assert comment',
      302
    )

    it('should render timing info without timing-long class', () => {

      //act
      const rendered = shallow(<AssertView assert={assert} />)

      //assert
      const timing = rendered.find('.assert .timing')
      expect(timing).to.have.length(1)
      expect(timing.hasClass('timing-long')).to.be.false
    })

    it('should render timing info with timing-long class when > 1000 ms', () => {
      assert.time = 1001

      //act
      const rendered = shallow(<AssertView assert={assert} />)

      //assert
      const timing = rendered.find('.assert .timing')
      expect(timing).to.have.length(1)
      expect(timing.hasClass('timing-long')).to.be.true
    })
  })

})
