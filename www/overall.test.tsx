import 'mocha'
import * as React from 'react'
import { expect } from 'chai'
import { shallow } from 'enzyme'

import { Overall } from './overall'
import { Summary, Assert } from '../src/parser/results'

var jsdom = require('mocha-jsdom')

describe('<Overall />', () => {
    jsdom()

    describe('undefined summary', () => {

        it('should render with overall-waiting class', () => {
            // act
            const instance = shallow(<Overall summary={undefined} />)

            const outerDiv = instance.find('.overall')
            expect(outerDiv.hasClass('overall-waiting')).to.be.true
        })
    })

    describe('summary with a failed test', () => {
        const summary = new Summary()
        summary.time = '123ms'
        summary.tests = [
            new Assert(true, 1, 'test number 1'),
            new Assert(false, 2, 'test number 2'),
            new Assert(true, 3, 'test number 3')
        ]

        it('should render with overall-fail class', () => {
            // act
            const instance = shallow(<Overall summary={summary} />)

            const outerDiv = instance.find('.overall')
            expect(outerDiv.hasClass('overall-fail')).to.be.true
        })

        it('should render status message FAIL', () => {
            // act
            const instance = shallow(<Overall summary={summary} />)

            const status = instance.find('.status')
            expect(status.text()).to.equal('FAIL')

        })

        it('should render the summary message', () => {
            // act
            const instance = shallow(<Overall summary={summary} />)

            const outerDiv = instance.find('.summary')

            expect(outerDiv.text()).to.contain('2 / 3')
            expect(outerDiv.text()).to.contain('123ms')
        })
    })

    describe('summary with a bailout', () => {
        const summary = new Summary()
        summary.time = '123ms'
        summary.tests = [
            new Assert(true, 1, 'test number 1'),
            new Assert(false, 2, 'test number 2')
        ]
        summary.bailout = 'bailout on test number 2'

        it('should render with overall-bailout class', () => {
            // act
            const instance = shallow(<Overall summary={summary} />)

            const outerDiv = instance.find('.overall')
            expect(outerDiv.hasClass('overall-bailout')).to.be.true
        })

        it('should render status message BAILOUT', () => {
            // act
            const instance = shallow(<Overall summary={summary} />)

            const status = instance.find('.status')
            expect(status.text()).to.equal('BAILOUT')

        })

        it('should render the summary message', () => {
            // act
            const instance = shallow(<Overall summary={summary} />)

            const outerDiv = instance.find('.summary')

            expect(outerDiv.text()).to.contain('1 / 2')
            expect(outerDiv.text()).to.contain('bailout on test number 2')
        })
    })

    describe('summary with successful tests', () => {
        const summary = new Summary()
        summary.time = '123ms'
        summary.tests = [
            new Assert(true, 1, 'test number 1'),
            new Assert(true, 2, 'test number 2'),
            new Assert(true, 3, 'test number 3'),
            new Assert(true, 4, 'test number 4')
        ]

        it('should render with overall-pass class', () => {
            // act
            const instance = shallow(<Overall summary={summary} />)

            const outerDiv = instance.find('.overall')
            expect(outerDiv.hasClass('overall-pass')).to.be.true
        })

        it('should render status message PASS', () => {
            // act
            const instance = shallow(<Overall summary={summary} />)

            const status = instance.find('.status')
            expect(status.text()).to.equal('PASS')

        })

        it('should render the summary message', () => {
            // act
            const instance = shallow(<Overall summary={summary} />)

            const outerDiv = instance.find('.summary')

            expect(outerDiv.text()).to.contain('4 / 4')
            expect(outerDiv.text()).to.contain('123ms')
        })
    })
})