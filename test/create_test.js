/**
 * Test case for create.
 * Runs with mocha.
 */
'use strict'

const create = require('../lib/create.js')
const assert = require('assert')


describe('create', function () {
  this.timeout(3000)

  before(async () => {

  })

  after(async () => {

  })

  it('Create', async () => {
    let filename = `${__dirname}/../tmp/foo/bar.json`
    let store = create(filename)
    assert.ok(store)
    assert.equal(store.storage.filename, filename)
  })
})

/* global describe, before, after, it */
