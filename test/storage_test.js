/**
 * Test case for storage.
 * Runs with mocha.
 */
'use strict'

const Storage = require('../lib/storage.js')
const assert = require('assert')

const fs = require('fs')

describe('storage', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Storage', async () => {
    let filename = `${__dirname}/../tmp/testing-storage/storage01.json`
    let storage = new Storage(
      filename,
      { interval: 100 }
    )
    {
      await storage.write({ foo: 'bar' })
      let data = await storage.read()
      assert.deepEqual(data, { foo: 'bar' })
    }
    {
      await storage.write({ foo: 'baz' })
      let data = await storage.read()
      assert.deepEqual(data, { foo: 'baz' })
    }
    await storage.flush()
    assert.ok(fs.existsSync(filename))
    await storage.purge()
    await storage.purge()
    await storage.purge()
    assert.ok(!fs.existsSync(filename))
  })
})

/* global describe, before, after, it */
