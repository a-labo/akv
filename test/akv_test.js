/**
 * Test case for akv.
 * Runs with mocha.
 */
'use strict'

const AKV = require('../lib/akv.js')
const assert = require('assert')
const asleep = require('asleep')
const fs = require('fs')

describe('akv', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Akv', async () => {
    let filename = `${__dirname}/../tmp/testing-akv/akv.json`
    let akv = new AKV(filename, {interval: 100})

    await akv.touch()
    assert.ok(fs.existsSync(filename))
    await akv.destroy()
    assert.ok(!fs.existsSync(filename))

    {
      let {storage} = akv
      await storage.write({foo: 'baz'})
      let data = await storage.read()
      assert.deepEqual(data, {foo: 'baz'})
      assert.ok(storage.needsFlush)
      await asleep(300)
      assert.ok(!storage.needsFlush)
    }

    for (let i = 0; i < 5; i++) {
      await akv.set('index', String(i))
      let index = await akv.get('index')
      assert.equal(index, String(i))
    }

    for (let i = 0; i < 100; i++) {
      akv.set('index', String(i))
      akv.get('index').then((index) => {
        // console.log('index', index)
      })
    }
    assert.equal(await akv.get('index'), '99')

    assert.deepEqual(await akv.all(), await akv.all())
    assert.deepEqual(await akv.keys(), await akv.keys())

    await akv.commit()
  })
})

/* global describe, before, after, it */
