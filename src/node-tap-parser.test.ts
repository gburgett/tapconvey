import 'mocha'
import { expect } from 'chai'
import { Readable, Writable } from 'stream'

import * as u from './utils'
import { Results, Test, Assert, Comment } from './results'
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
    it('should send no results on data event, but should raise header event', (done) => {
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser()

      //act
      var version = ''
      instance.on('version', chunk => {
        console.log('onVersion', chunk)
        version = chunk.toString()
      })
      instance.on('data', chunk => {
        expect.fail('should not call data event')
      })
      instance.on('end', () => {
        console.log('end')
        expect(version).to.equal('13')
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
    # time=17.433ms
ok 2 - test/node-tap/test_2.js # time=200.785ms
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
        expect(chunk.time).to.equal('17.433ms')
        expect(chunk.items[0]).to.deep.equal(new Assert(true, 1, 'this is a good assert'))
        dataCount++
      })
      instance.on('end', () => {
        expect(dataCount).to.equal(1)
        done()
      })
      stdin.pipe(instance)
    })
  })
})
