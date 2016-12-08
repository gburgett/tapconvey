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

    it('should send null results object to callback', (done) => {
      const contents = ''
      const stdin = u.stringToStream(contents)

      const instance = new NodeTapParser((err, results) => {
        expect(err).to.be.null
        expect(results).to.be.null
        done()
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

  /*it.skip('should parse an empty file', (done) => {
    const contents = ``
    var objsOut, evtOut, cbOut = 0

    const expected = new Results
    const checkDone = () => {
      if (objsOut >= 1 && evtOut >= 1 && cbOut >= 1) {
        done()
      }
    }

    const stdin = u.stringToStream(contents)
    const objOut = new Writable({
      objectMode: true,
      write(chunk: any, encoding, cb) {
        console.log('onWrite')
        objsOut = objsOut + 1
        expect(objsOut).to.equal(1)
        expect(chunk).to.equal(expected)
        checkDone()
        cb()
      }
    })

    const instance = new NodeTapParser((err, results) => {
      console.log('onCb')
      expect(err).to.be.empty
      cbOut++
      expect(objsOut).to.equal(1)
      expect(results).to.equal(expected)
      checkDone()
    })
    instance.on('results', results => {
      console.log('onResults')
      evtOut++
      expect(evtOut).to.equal(1)
      expect(results).to.equal(expected)
      checkDone()
    })
    stdin.pipe(instance).pipe(objOut)

    //act
    stdin.push(contents)


  })*/
})
