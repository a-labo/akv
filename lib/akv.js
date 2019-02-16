/**
 * A simple key value store
 * @class AKV
 * @param {string} filename - Filename to store data
 * @param {Object} [options]
 * @param {number} [options.interval=1000] - Flush interval
 */
'use strict'

const Storage = require('./storage')

/** @lends AKV */
class AKV {
  constructor (filename, options = {}) {
    if (!filename) {
      throw new Error('filename is required')
    }
    const {
      interval = 1000
    } = options
    this.storage = new Storage(filename, {interval}).start(interval)

    process.setMaxListeners(process.getMaxListeners() + 2)
    process.on('beforeExit', () => this.handleBeforeExit())
    process.on('exit', () => this.handleExit())
  }

  /**
   * Touch file
   * @function touch
   * @returns {Promise}
   */
  async touch () {
    const s = this
    const {storage} = s
    let data = await storage.read()
    data = data || {}
    await storage.write(data)
    await storage.flush()
  }

  /**
   * Set a value
   * @function set
   * @param {string} key
   * @param {string} value
   * @returns {Promise}
   */
  async set (key, value) {
    const {storage} = this
    let data = await storage.read()
    data = data || {}
    data[key] = value
    await storage.write(data)
  }

  /**
   * Get all keys
   * @function keys
   * @returns {Promise}
   */
  async keys () {
    const {storage} = this
    let data = await storage.read()
    return Object.keys(data || {})
  }

  /**
   * Get a value
   * @function get
   * @param {string} key
   * @returns {Promise}
   */
  async get (key) {
    const {storage} = this
    let data = await storage.read()
    return data && data[key]
  }

  /**
   * Get all values
   * @function all
   * @returns {Promise}
   */
  async all () {
    const {storage} = this
    let data = await storage.read()
    return data || {}
  }

  /**
   * Delete a value
   * @function del
   * @param {string} key
   * @returns {Promise}
   */
  async del (key) {
    const {storage} = this
    let data = await storage.read()
    if (!data) {
      return
    }
    delete data[key]
    await storage.write(data)
  }

  /**
   * Delete all values
   * @function destroy
   * @returns {Promise}
   */
  async destroy () {
    const {storage} = this
    await storage.purge()
  }

  /**
   * Commit changes
   * @returns {Promise}
   */
  async commit () {
    const {storage} = this
    await storage.flush()
    storage.needsFlush = false
  }

  handleBeforeExit () {
    const {storage} = this
    storage.flushIfNeeded()
    storage.needsFlush = false
  }

  handleExit () {
    const {storage} = this
    if (this.storage.needsFlush) {
      console.warn('[akv] Some uncommitted change has lost. Make sure to call akv.commit() before existing.')
    }
  }
}

module.exports = AKV
