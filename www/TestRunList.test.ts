import 'mocha'
import { expect } from 'chai'

import { asMap } from 'mobx'

import { Client, TestRun, RequestError } from './client'
import { Summary, Test, Assert, Comment, Log, Plan } from '../src/parser/results'
import { TestRunList } from './TestRunList'

var jsdom = require('mocha-jsdom')
var port = 9876

describe('testRunList', () => {
  describe('getStdin', () => {
    it('should return nothing when no tests', () => {
      const mockClient = <Client>{};
      const instance = new TestRunList(mockClient)

      //act
      const stdin = instance.stdin

      //assert
      expect(stdin.source).to.equal('stdin')
      expect(stdin.run).to.be.undefined
    })

    it('should return nothing when tests doesnt include stdin source', () => {
      const mockClient = <Client>{};
      const instance = new TestRunList(mockClient, asMap<TestRun>({
        'another_source': new TestRun()
      }))

      //act
      const stdin = instance.stdin

      //assert
      expect(stdin.source).to.equal('stdin')
      expect(stdin.run).to.be.undefined
    })

    it('should return stdin test when it exists', () => {
      const expected = new TestRun()
      expected.summary = new Summary()
      expected.summary.version = 13
      expected.summary.time = '123ms'
      expected.tests = new Array<Test>()
      expected.tests.push(
        new Test(1, 'abc456'),
        new Test(2, 'abc123')
      )

      const mockClient = <Client>{};
      const instance = new TestRunList(mockClient, asMap<TestRun>({
        'stdin': expected
      }))

      //act
      const stdin = instance.stdin

      //assert
      expect(stdin.source).to.equal('stdin')
      expect(stdin.run).to.equal(expected)

    })
  })
})
