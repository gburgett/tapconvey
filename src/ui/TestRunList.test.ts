import 'mocha'
import { expect } from 'chai'
import * as sinon from 'sinon'

import { asMap, observe } from 'mobx'

import { Client, TestRun, RequestError } from './client'
import { Summary, Test, Assert, Comment, Log, Plan } from '../lib/parser/results'
import { TestRunList } from './TestRunList'

var port = 9876

describe('testRunList', () => {
  describe('getStdin', () => {
    it('should return nothing when no tests', () => {
      const mockClient = <Client>{};
      const instance = new TestRunList(mockClient)

      //act
      const stdin = instance.stdin

      //assert
      expect(stdin).to.be.undefined
    })

    it('should return nothing when tests doesnt include stdin source', () => {
      const mockClient = <Client>{};
      const instance = new TestRunList(mockClient, asMap<TestRun>({
        'another_source': new TestRun()
      }))

      //act
      const stdin = instance.stdin

      //assert
      expect(stdin).to.be.undefined
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

  describe('update', () => {
    it('should update observable cache on success', function (done) {
      const done2 = multiDone('promise', 'observable')(done)

      const expected = new TestRun()
      expected.summary = new Summary()
      expected.summary.version = 13
      expected.summary.time = '123ms'
      expected.tests = new Array<Test>()
      expected.tests.push(
        new Test(1, 'abc456'),
        new Test(2, 'abc123')
      )

      const mockClient = <Client>{ getAllRuns: function () { } };
      const mock = sinon.mock(mockClient)
      mock.expects('getAllRuns').once()
        .returns(new Map<string, TestRun>([['stdin', expected]]))

      const instance = new TestRunList(mockClient, asMap())

      observe(instance, 'stdin', (newValue, oldValue) => {
        expect(newValue).to.deep.equal({
          source: 'stdin',
          run: expected
        }, 'newValue')
        expect(oldValue).to.be.undefined

        done2('observable')
      })

      //act
      instance.update()
        .then(
        () => {
          done2('promise')
        },
        error => {
          done(error)
        }
        )
    })

    it('should not update observable cache on failure', function (done) {
      const done2 = multiDone('promise', 'observable')(done)

      const expected = new TestRun()
      expected.summary = new Summary()
      expected.summary.version = 13
      expected.summary.time = '123ms'
      expected.tests = new Array<Test>()
      expected.tests.push(
        new Test(1, 'abc456'),
        new Test(2, 'abc123')
      )

      const mockClient = <Client>{ getAllRuns: function () { } };
      const mock = sinon.mock(mockClient)
      mock.expects('getAllRuns').once()
        .throws('mock error')

      const instance = new TestRunList(mockClient, asMap())

      observe(instance, 'stdin', (newValue, oldValue) => {
        done('should not have updated computed value stdin')
      })

      //act
      instance.update()
        .then(
        () => {
          done('should not have completed promise successfully')
        },
        error => {
          try {
            expect(error.name).to.equal('mock error')
          } catch (failure) {
            done(failure)
            return
          }
          done()
        }
        )
    })
  })
})

function multiDone(...names: string[]): (done: MochaDone) => (name: string) => void {
  const toKill = new Map<string, number>()
  names.forEach(n => {
    toKill.set(n, 1)
  })
  return done => name => {
    const had = toKill.delete(name)
    if (!had) {
      done(`done called for '${name}' more than once`)
    } else if (toKill.size == 0) {
      done()
    }
  }
}