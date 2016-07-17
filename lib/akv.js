/**
 * A simple key value store
 * @class AKV
 * @param {string} filename - Filename to store data
 * @param {Object} [options]
 */
'use strict'

const Storage = require('./storage')
const co = require('co')

/** @lends AKV */
class AKV {
  constructor (filename, options = {}) {
    const s = this
    if (!filename) {
      throw new Error('filename is required')
    }
    s.storage = new Storage(filename)
  }

  /**
   * Set a value
   * @function set
   * @param {string} key
   * @param {string} value
   * @returns {Promise}
   */
  set (key, value) {
    const s = this
    let { storage } = s
    return co(function * () {
      let data = yield storage.read()
      data = data || {}
      data[ key ] = value
      yield storage.write(data)
    })
  }

  /**
   * Get a value
   * @functio get
   * @param {string} key
   * @returns {Promise}
   */
  get (key) {
    const s = this
    let { storage } = s
    return co(function * () {
      let data = yield storage.read()
      return data && data[ key ]
    })
  }

  /**
   * Delete a value
   * @function del
   * @param {string} key
   * @returns {Promise}
   */
  del (key) {
    const s = this
    let { storage } = s
    return co(function * () {
      let data = yield storage.read()
      if (!data) {
        return
      }
      delete data[ key ]
      yield storage.write(data)
    })
  }

  /**
   * Delete all values
   * @function destroy
   * @returns {Promise}
   */
  destroy () {
    const s = this
    let { storage } = s
    return co(function * () {
      yield storage.unlink()
    })
  }
}

module.exports = AKV
