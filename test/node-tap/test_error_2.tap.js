var tap = require('tap')

tap.test('test F should fail with a deep thrown error', function(t) {
  t.plan(1)

  t.test('test F.F should fail with an error', function(t) {
    throw new Error('this is a deep uncaught error')
  })
})
