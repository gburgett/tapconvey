var tap = require('tap')

tap.comment('hello this is a comment outside')

tap.equal(2, 2, 'this assert should succeed')

tap.test('test A', function(t) {
  t.plan(2)
  t.comment('hello this is a comment in A')

  console.log('this is some console stuff in A')

  t.equal(3, 3, 'this assert should succeed in A')

  t.test('test A.A', function(t) {
    t.plan(0)
    t.comment('hello this is a comment in A.A')
  })
})

tap.test('test B', function(t) {
  t.plan(2)

  t.equal(3, 4, 'this assert should fail in B')
  t.equal(3, 3, 'this assert should succeed in B')
})

tap.comment('hello this is a comment in the middle')

tap.equal(2, 1, 'this assert should fail')

tap.test('test C should fail with plan != count', function(t) {
  t.plan(3)

  t.equal(3, 3, 'this assert should succeed in C')
  console.error('some stderr')
})

tap.test('test D should fail with plan != count', function(t) {
  t.plan(1)

  t.equal(3, 3, 'this assert should succeed in C')

  t.test('test D.D should be OK', function (t) {
    t.plan(1)

    t.ok(true, 'this is ok 1')
  })

  t.test('test D.D2 should be OK', function (t) {
    t.plan(2)

    t.test('test D.D.D1', function(t){
      t.plan(1)
      t.ok(true, 'this is OK')
    })
    t.ok(true, 'this is OK 2')
  })
})

v.skip('test skip should be skipped', function(t){
  t.plan(1)

  t.ok(true, 'this should be skipped')
})

tap.test('test G should fail with a deep test failure', function(t){
  t.plan(1)

  t.test('test G.G should fail with a deep test failure', function(t) {
    t.plan(1)
    t.test('test G.G.G should fail', function(t) {
      t.plan(1)
      t.ok(false, 'this assert is not OK')
    })
  })
})
