import 'mocha'
import { expect } from 'chai'
import { spawn } from 'child_process'

import NodeTapParser from '../../src/parser'
import { Test } from '../../src/parser/results'

describe('running tap test files', () => {

  function runFile(fileName: string): NodeTapParser {
    const proc = spawn('./node_modules/.bin/tap', ['-R', 'tap', fileName])

    const ret = new NodeTapParser()
    proc.stdout.pipe(ret)
    proc.stderr.pipe(ret)

    return ret
  }

  describe('test_1.js', () => {
    it('should have one master test', done => {
      const instance = runFile('./test/node-tap/test_1.tap.js')

      var tests: Test[] = []
      instance.on('data', (test) => {
        if (test instanceof Test) {
          tests.push(test)
        }
      })

      instance.on('end', () => {
        expect(tests).to.have.length(1)

        done()
      })
    })
  })

  describe('run all', () => {
    it('should have 4 master tests', done => {
      const instance = runFile('./test/node-tap/*.tap.js')

      var tests: Test[] = []
      instance.on('data', (test) => {
        if (test instanceof Test) {
          tests.push(test)
        }
      })

      instance.on('end', () => {
        expect(tests).to.have.length(4)

        done()
      })
    })
  })


})
