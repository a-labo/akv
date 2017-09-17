/**
 * File system storage
 * @augments EventEmitter
 * @class Storage
 * @param {string} filename
 * @param {Object} data
 */
'use strict'

const {EventEmitter} = require('events')
const fs = require('fs')
const readFromFile = require('./file/read_from_file')
const writeToFile = require('./file/write_to_file')
const fileHash = require('./file/file_hash')

/** @lends Storage */
class Storage extends EventEmitter {
  constructor (filename) {
    super()
    const s = this
    s.filename = filename
    s.hash = null
    s.memory = null
    s.needsFlush = false
    s._flushing = false
    s._flushTimer = -1
  }

  /**
   * Read data
   * @returns {Promise}
   */
  async read () {
    const s = this
    const {filename, memory} = s
    const hash = await fileHash(filename)
    let cached = !hash || (s.hash === hash)
    if (cached) {
      return memory
    }
    s.hash = hash

    let data = readFromFile(filename)
    s.memory = data
    return data
  }

  /**
   * Write data
   * @param data
   * @returns {*|Promise}
   */
  async write (data) {
    const s = this
    const {filename} = s
    s.memory = data
    s.hash = await fileHash(filename)
    s.needsFlush = true
  }

  /**
   * Save data into file system
   * @returns {Promise}
   */
  async flush () {
    const s = this
    const {filename, memory} = s
    if (s._flushing) {
      clearTimeout(s._flushTimer)
      s._flushTimer = setTimeout(() => s.flush(), 100)
      return
    }
    s._flushing = true
    await writeToFile(filename, memory)
    s.hash = await fileHash(filename)
    s._flushing = false
  }

  /**
   * Flush only if needed
   * @returns {Promise}
   */
  async flushIfNeeded () {
    const s = this
    if (s.needsFlush) {
      await s.flush()
      s.emit('flush', {data: s.memory})
      s.needsFlush = false
    }
  }

  /**
   * Purge data
   * @returns {Promise}
   */
  async purge () {
    const s = this
    const {filename, memory} = s
    clearTimeout(s._flushTimer)
    s.memory = null
    const exists = fs.existsSync(filename)
    if (exists) {
      fs.unlinkSync(filename)
      s.emit('purge', {filename, memory})
    }
  }

  start (interval) {
    const s = this
    if (s._timer) {
      throw new Error('Already started!')
    }
    s._timer = setInterval(() => {
      s.flushIfNeeded()
    }, interval).unref()
    return s
  }

  stop () {
    const s = this
    clearInterval(s._timer)
    return s
  }
}

module.exports = Storage
