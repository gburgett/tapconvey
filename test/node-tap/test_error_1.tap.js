var tap = require('tap')

tap.test('test E should fail with a thrown error', function(t) {
  t.plan(1)

  throw new Error('this is an uncaught error')
})
