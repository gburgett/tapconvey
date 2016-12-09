import 'mocha'
import { expect } from 'chai'
import { Readable, Writable } from 'stream'

import * as u from './utils'
import { Summary, Test, Assert, Comment, Log } from './results'
import NodeTapParser from './node-tap-parser'

describe('NodeTapParser', () => {
  describe('empty file', () => {
    it('should send no results on data event', (done) => {
      const contents = ''
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser()


      //act
      instance.on('data', chunk => {
        expect.fail('should not call data event')
      })
      instance.on('end', () => {
        done()
      })
      stdin.pipe(instance)
    })

    it('should send null error object to callback', (done) => {
      const contents = ''
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser((err) => {
        expect(err).to.be.null
        done()
      })
      instance.on('error', err => {
        expect.fail('should not raise error, raised:', err)
      })

      //act
      stdin.pipe(instance)
      instance.read()
    })

    it('should return null from read', () => {
      const contents = ''
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser()

      //act
      stdin.pipe(instance)
      const result = instance.read()

      expect(result).to.be.null
    })
  })

  describe('file with garbage input', () => {
    const contents = `a;lskdfjqwelru
      al;skdejfqwer
      `

    it('should send no results on data event, and should not raise error', (done) => {
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser()

      //act
      instance.on('data', chunk => {
        expect.fail('should not call data event')
      })
      instance.on('end', () => {
        done()
      })
      stdin.pipe(instance)
    })

    it('should send null error object to callback', (done) => {
      const contents = ''
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser((err) => {
        expect(err).to.be.null
        done()
      })
      instance.on('error', err => {
        expect.fail('should not raise error, raised:', err)
      })

      //act
      stdin.pipe(instance)
      instance.read()
    })

    it('should return null from read', () => {
      const contents = ''
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser()

      //act
      stdin.pipe(instance)
      const result = instance.read()

      expect(result).to.be.null
    })
  })

  describe('file with just header', () => {
    const contents = `TAP version 13
`
    it('should send no results on data event, but sends summary', (done) => {
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser()

      //act
      var version
      instance.on('summary', (chunk: Summary) => {
        console.log('onSummary', chunk)
        version = chunk.version
      })
      instance.on('data', chunk => {
        expect.fail('should not call data event')
      })
      instance.on('end', () => {
        console.log('version: ', typeof version, version)
        expect(version).to.equal(13)
        done()
      })
      stdin.pipe(instance)
    })

    it('should send null error object to callback', (done) => {
      const contents = ''
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser((err) => {
        expect(err).to.be.null
        done()
      })
      instance.on('error', err => {
        expect.fail('should not get error, got: ', err)
      })

      //act
      stdin.pipe(instance)
      instance.read()
    })

    it('should return null from read', () => {
      const contents = ''
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser()

      //act
      stdin.pipe(instance)
      const result = instance.read()

      expect(result).to.be.null
    })

  })

  describe('file with one good test', () => {
    const contents = `TAP version 13
# Subtest: test/node-tap/test_2.js
    1..1
    ok 1 - this is a good assert
    # time=17.336ms
ok 1 - test/node-tap/test_2.js # time=202.366ms

1..1
# time=215.537ms

`

    it('should send one test result on data event', done => {
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser()

      //act
      var dataCount = 0
      instance.on('data', (chunk: Test) => {
        expect(chunk).is.instanceOf(Test)
        expect(chunk.name).to.equal('test/node-tap/test_2.js')
        expect(chunk.asserts).to.equal(1)
        expect(chunk.successfulAsserts).to.equal(1)
        expect(chunk.success).to.be.true
        expect(chunk.time).to.equal('17.336ms')
        expect(chunk.items[0]).to.deep.equal(new Assert(true, 1, 'this is a good assert'))
        dataCount++
      })
      instance.on('end', () => {
        expect(dataCount).to.equal(1)
        done()
      })
      stdin.pipe(instance)
    })

    it('should send a summary result', done => {
      const stdin = u.stringToStream(contents)

      var summaryCount = 0
      const instance = new NodeTapParser()
      instance.on('summary', (summary: Summary) => {
        summaryCount++
        expect(summary.time).to.equal('215.537ms', 'summary.time')
        expect(summary.tests.length).to.equal(1, 'summary.tests.length')
        expect(summary.tests[0].success).to.be.true
        expect(summary.tests[0].id).to.equal(1, 'tests[0].id')
        expect(summary.tests[0].time).to.equal(202.366, 'tests[0].time')
        expect(summary.tests[0].comment).to.equal('test/node-tap/test_2.js', 'tests[0].comment')
      })
      instance.on('end', () => {
        expect(summaryCount).to.equal(1)
        done()
      })

      // act
      stdin.pipe(instance)
      instance.resume()
    })
  })

  describe('test of multiple files', () => {
    const contents = `TAP version 13
# Subtest: test/node-tap/test_2.js
    1..1
    ok 1 - this is a good assert
    # time=16.476ms
ok 1 - test/node-tap/test_2.js # time=198.802ms

# Subtest: test/node-tap/test_3.js
    1..2
    ok 1 - this is a good assert for #3
    ok 2 - this is a good assert for #4
    # time=17.988ms
ok 2 - test/node-tap/test_3.js # time=194.329ms

1..2
# time=406.04ms

`

    it('should send two test results on data event', done => {
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser()

      //act
      var tests: Test[] = []
      instance.on('data', (chunk: Test) => {
        expect(chunk).is.instanceOf(Test)
        tests.push(chunk)
      })
      instance.on('end', () => {
        expect(tests.length).to.equal(2, 'tests.length')

        expect(tests[0].name).to.equal('test/node-tap/test_2.js', 'test[0].name')

        expect(tests[1].name).to.equal('test/node-tap/test_3.js', 'test[1].name')
        expect(tests[1].asserts).to.equal(2, 'asserts')
        expect(tests[1].successfulAsserts).to.equal(2, 'successfulAsserts')
        expect(tests[1].success).to.be.true
        expect(tests[1].time).to.equal('17.988ms', 'time')
        expect(tests[1].items[0]).to.deep.equal(new Assert(true, 1, 'this is a good assert for #3'))
        expect(tests[1].items[1]).to.deep.equal(new Assert(true, 2, 'this is a good assert for #4'))

        done()
      })
      stdin.pipe(instance)
    })


    it('should send summary in callback', done => {
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser((error: Error, summary: Summary) => {
        expect(error).to.be.null
        expect(summary.version).to.equal(13, 'summary.version')
        expect(summary.time).to.equal('406.04ms', 'summary.time')
        expect(summary.tests.length).to.equal(2, 'summary.tests.length')

        const test0 = summary.tests[0]
        expect(test0.id).to.equal(1, 'test0.id')
        expect(test0.comment).to.equal('test/node-tap/test_2.js', 'test0.comment')
        expect(test0.time).to.equal(198.802, 'test0.time')
        expect(test0.success).to.be.true

        const test1 = summary.tests[0]
        expect(test1.id).to.equal(1, 'test1.id')
        expect(test1.comment).to.equal('test/node-tap/test_2.js', 'test1.comment')
        expect(test1.time).to.equal(198.802, 'test1.time')
        expect(test1.success).to.be.true

        done()
      })

      //act
      stdin.pipe(instance)
      instance.resume()
    })
  })

  describe('test with comments and stdout', () => {
    const contents = `TAP version 13
# Subtest: test/node-tap/test_2.js
    1..1
    heres some stdout
    that's even multiline
    # hello this is a comment
    ok 1 - this is a good assert
    # time=19.78ms
    and some more stdout
ok 1 - test/node-tap/test_2.js # time=206.12ms

1..1
# time=218.956ms
`
    it('should emit a single test with comment and log lines', (done) => {
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser()

      //act
      var tests: Test[] = []
      instance.on('data', (chunk: Test) => {
        expect(chunk).is.instanceOf(Test)
        tests.push(chunk)
      })
      instance.on('end', () => {
        expect(tests.length).to.equal(1, 'tests.length')

        expect(tests[0].name).to.equal('test/node-tap/test_2.js', 'test[0].name')
        expect(tests[0].asserts).to.equal(1, 'asserts')
        expect(tests[0].successfulAsserts).to.equal(1, 'successfulAsserts')
        expect(tests[0].items[0]).to.deep.equal(new Log(
          'heres some stdout',
          "that's even multiline"
        ), 'items[0]')
        expect(tests[0].items[1]).to.deep.equal(new Comment('# hello this is a comment'), 'items[1]')
        expect(tests[0].items[2]).to.deep.equal(new Assert(true, 1, 'this is a good assert'), 'items[2]')
        expect(tests[0].items[3]).to.deep.equal(new Log('and some more stdout'), 'items[3]')

        done()
      })
      stdin.pipe(instance)
    })
  })

  describe('test with bailout', () => {
    const contents = `TAP version 13
# Subtest: test/node-tap/test_2.js
    1..2
    # Subtest: this test finishes
        1..1
        ok 1 - this is a good assert
    ok 1 - this test finishes # time=7.307ms

    # Subtest: this test bails out
        1..2
        ok 1 - this is another good assert
        Bail out! # some random error occured!
Bail out! # some random error occured!

`

    it('should show bailout on the summary', (done) => {
      const stdin = u.stringToStream(contents)

      var summaryCount = 0
      const instance = new NodeTapParser()
      instance.on('summary', (summary: Summary) => {
        summaryCount++

        expect(summary.bailout).to.equal('# some random error occured!', 'bailout reason')

        expect(summary.time).to.be.undefined
        expect(summary.tests.length).to.equal(1, 'summary.tests.length')
        expect(summary.tests[0].success).to.equal(false, 'tests[0].success')
        expect(summary.tests[0].comment).to.equal('test/node-tap/test_2.js', 'tests[0].comment')

      })
      instance.on('end', () => {
        expect(summaryCount).to.equal(1)
        done()
      })

      // act
      stdin.pipe(instance)
      instance.resume()
    })

    it('should dump the bailed out test', (done) => {
      const stdin = u.stringToStream(contents)

      var tests: Test[] = []
      const instance = new NodeTapParser()
      instance.on('data', (data: Test) => {
        tests.push(data)
      })
      instance.on('end', () => {
        expect(tests).to.have.length(1, 'tests')

        expect(tests[0].success).to.be.false
        expect(tests[0].bailout).to.equal('# some random error occured!')
        expect(tests[0].asserts).to.equal(1, 'tests[0].asserts')
        expect(tests[0].successfulAsserts).to.equal(1, 'tests[0].successfulAsserts')

        const sub0 = tests[0].items[0]
        expect(sub0).to.be.instanceof(Test)
        const test0 = sub0 as Test
        expect(test0.success).to.be.true
        const ass0 = tests[0].items[1] as Assert
        expect(ass0.id).to.equal(1, 'assert for test0 id')
        expect(ass0.comment).to.equal('this test finishes', 'assert for test0 name')
        expect(ass0.success).to.equal(true, 'assert for test0 success')
        expect(ass0.time).to.equal(7.307, 'assert for test0 time')

        const sub2 = tests[0].items[2]
        expect(sub2).to.be.instanceof(Test)
        const test1 = sub2 as Test
        expect(test1.success).to.be.false
        expect(test1.bailout).to.equal('# some random error occured!')
        const ass1 = tests[0].items[3] as Assert
        expect(ass1.id).to.equal(-1, 'assert for test1 id should be bailout indicator')
        expect(ass1.comment).to.equal('this test bails out', 'assert for test1 name')
        expect(ass1.success).to.equal(false, 'assert for test1 success')
        expect(ass1.time).to.equal(undefined, 'assert for test1 time')




        done()
      })

      // act
      stdin.pipe(instance)
    })
  })
})
