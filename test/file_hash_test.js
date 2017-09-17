/**
 * Test case for fileHash.
 * Runs with mocha.
 */
'use strict'

const fileHash = require('../lib/file/file_hash.js')
const assert = require('assert')


describe('file-hash', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('File hash', async () => {
    {
      let hash = await fileHash(__filename)
      assert.ok(hash)
    }
  })
})

/* global describe, before, after, it */
