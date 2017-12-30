import 'mocha'
import { expect } from 'chai'

import * as u from './index'

describe('stringToStream', () => {
  describe('empty string', () => {
    it('should fire end event', (done) => {
      const instance = u.stringToStream('')

      instance.on('end', done)

      //act
      instance.resume()
    })

    it('should not fire data event', (done) => {
      const instance = u.stringToStream('')

      instance.on('data', () => {
        expect.fail
      })

      instance.on('end', done)
    })

    it('read() should return null buffer', () => {

      const instance = u.stringToStream('')

      //act
      const got = instance.read()

      expect(got).to.equal(null)
    })
  })

  describe('short string', () => {
    it('should fire end event', (done) => {
      const instance = u.stringToStream('abcd1234')

      instance.on('end', done)

      //act
      instance.resume()
    })

    it('should give string in single chunk', (done) => {
      const instance = u.stringToStream('abcd1234')

      var gotChunk = false
      instance.on('data', (chunk) => {
        gotChunk = true
        expect(chunk.toString()).to.equal('abcd1234')
      })

      instance.on('end', () => {
        expect(gotChunk).to.be.true
        done()
      })
    })

    it('read() should return expected string', () => {

      const instance = u.stringToStream('abcd1234')

      //act
      const got = instance.read()

      expect(got.toString()).to.equal('abcd1234')
    })
  })

  describe('long string', () => {
    it('should fire end event', (done) => {
      const instance = u.stringToStream('abcd1234', 5)

      instance.on('end', done)

      //act
      instance.resume()
    })

    it('should give string in single chunk', (done) => {
      const instance = u.stringToStream('abcd1234', 5)

      var chunks = []
      instance.on('data', (chunk) => {
        chunks.push(chunk.toString())
      })

      instance.on('end', () => {
        expect(chunks).to.have.length(2)
        expect(chunks).to.deep.equal(['abcd1', '234'])
        done()
      })
    })

    it('read() should return partial string', () => {

      const instance = u.stringToStream('abcd1234', 5)

      //act
      const got = instance.read(6)

      expect(got.toString()).to.equal('abcd12')
    })
  })
})
