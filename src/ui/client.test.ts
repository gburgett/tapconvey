import { expect } from 'chai'
import * as fetchMock from 'fetch-mock'
import { ClientImpl, TestRun, RequestError } from './client'
import { Summary, Test, Assert, Comment, Log, Plan } from '../lib/parser/results'
import { Server } from './_testserver'

var port = 9876

describe('Client', () => {

  describe('getAllRuns', () => {
    it('should throw error on no connection', () => {
      const instance = new ClientImpl(`http://localhost:${port}/api`)

      return instance.getAllRuns().then(
        data => {
          expect.fail('should not give data')
        },
        (error) => {
          expect(error).to.be.instanceof(Error)
          expect(error.message).to.contain('ECONNREFUSED')
        }
      )
    })

    it('should throw error on 404', function () {

      fetchMock.once(/\/api/, 404)

      const instance = new ClientImpl(`http://localhost:9999/api`)

      // act
      return instance.getAllRuns().then(
        data => {
          expect.fail('should not give data')
        },
        (error: RequestError) => {
          // assert
          expect(error).to.be.instanceof(Error)
          expect(error.message).to.equal(`Not Found`)
          expect(error.response.statusCode).to.equal(404)
        }
      )
    })

    it('should throw error on 500', function () {

      fetchMock.once(/\/api/, 500)

      const instance = new ClientImpl(`http://localhost:9999/api`)

      // act
      return instance.getAllRuns().then(
        data => {
          expect.fail('should not give data')
        },
        (error: RequestError) => {
          // assert
          expect(error).to.be.instanceof(Error)
          expect(error.message).to.equal(`Internal Server Error`)
          expect(error.response.statusCode).to.equal(500)
        }
      )
    })

    it('should throw error on 304', function () {

      fetchMock.once(/\/api/, 304)

      const instance = new ClientImpl(`http://localhost:9999/api`)

      return instance.getAllRuns().then(
        data => {
          expect.fail('should not give data')
        },
        (error: RequestError) => {
          // assert
          expect(error).to.be.instanceof(Error)
          expect(error.message).to.equal(`Not Modified`)
          expect(error.response.statusCode).to.equal(304)
        }
      )
    })

    it('should return null if no data', function () {

      fetchMock.once(/\/api/, {})

      const instance = new ClientImpl(`http://localhost:9999/api`)

      return instance.getAllRuns().then(
        data => {
          expect(data).to.be.null
        },
        (error: RequestError) => {
          throw error
        }
      )
    })

    it('should return error on bad data', function () {

      fetchMock.once(/\/api/, {
        headers: {
          'content-type': 'application/json'
        },
        body: '{ \"this starts out\" : \"as some json\" but... '
      })
      const instance = new ClientImpl(`http://localhost:9999/api`)

      return instance.getAllRuns().then(
        data => {
          expect.fail('should not send data but got: ', data)
        },
        (error) => {
          expect(error.name).to.equal('SyntaxError')
        }
      )
    })

    it('should return downloaded data', function () {
      const expected = new TestRun()
      expected.summary = (() => {
        const s = new Summary()
        s.version = 13
        s.time = "12345ms"
        s.tests = [
          new Assert(true, 1, "test_1.js", 1000),
          new Assert(false, 2, "test_2.js", 850)
        ]
        s.extra = new Log(["abcd", "1234"])
        return s
      })()
      expected.tests = [
        new Test(1, "test_1.js", true, 1, 1, "1234ms", new Plan(1, 1),
          [],
          new Assert(true, 1, "1 should equal 1", 100)),
        new Test(2, "test_2.js", false, 2, 1, "1234ms", new Plan(1, 2),
          [],
          new Comment("a starting comment"),
          new Assert(false, 1, "1 should equal 2", 120),
          new Log(["some", "log", "lines"]),
          new Test(2, 'subtest 2', true, 1, 1, 'abcd', new Plan(1, 1),
            ['test_2.js'],
            new Comment("a subcomment"),
            new Assert(true, 1, "1 == 1", 50)),
          new Assert(true, 2, "subtest 2", 100)),
      ]

      const testServer = new Server()
      testServer.pushNewTestRun('stdin')
      testServer.pushTests('stdin', ...expected.tests)
      testServer.pushSummary('stdin', expected.summary)

      fetchMock.once(/\/api\/allRuns/, {
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(testServer.getAllTestRuns())
      })

      const instance = new ClientImpl(`http://localhost:9999/api`)

      // act
      return instance.getAllRuns().then(
        map => {
          // assert
          expect(map.size).to.equal(1, 'expect map with one source')
          expect(map.keys().next().value).to.equal('stdin', 'expect single source to be stdin')

          const data = map.get('stdin')
          expect(data).to.deep.equal(expected)
          expect(data).to.be.instanceof(TestRun)

          expect(data.summary).to.be.instanceof(Summary)
          expect(data.summary.tests[0]).to.be.instanceof(Assert, 'data.summary.tests')
          expect(data.summary.extra).to.be.instanceof(Log)

          expect(data.tests[0]).to.be.instanceof(Test)
          expect(data.tests[1]).to.be.instanceof(Test)

          const test2 = data.tests[1]
          expect(test2.items[0]).to.be.instanceof(Comment)
          expect(test2.items[1]).to.be.instanceof(Assert, 'test2.items[1]')
          expect(test2.items[2]).to.be.instanceof(Log)
          expect(test2.items[3]).to.be.instanceof(Test, 'test2.items[3]')
          expect(test2.items[4]).to.be.instanceof(Assert, 'test2.items[4]')

          const subtest_2 = test2.items[3] as Test
          expect(subtest_2.path).to.deep.equal(['test_2.js'], 'subtest_2.path')
          expect(subtest_2.items[0]).to.be.instanceof(Comment, 'subtest_2.items[0]')
          expect((subtest_2.items[0] as Comment).comment).to.equal('a subcomment')
          expect(subtest_2.items[1]).to.be.instanceof(Assert, 'subtest_2.items[1]')
        },
        (error) => {
          throw error
        }
      )
    })
  })
})
