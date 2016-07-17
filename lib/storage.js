/**
 * File system storage
 * @augments EventEmitter
 * @class Storage
 * @param {string} filename
 * @param {Object} data
 */
'use strict'

const { EventEmitter } = require('events')
const { crc32 } = require('crc')
const co = require('co')
const path = require('path')
const { existsAsync, statAsync, readFileAsync, mkdirpAsync, writeFileAsync, unlinkAsync } = require('asfs')

let fileHash = (filename) => co(function * () {
  let stat = (yield existsAsync(filename)) && (yield statAsync(filename))
  return stat && crc32(JSON.stringify(stat))
})

let fromFile = (filename) => co(function * () {
  let exists = yield existsAsync(filename)
  if (!exists) {
    return null
  }
  return JSON.parse((yield readFileAsync(filename)).toString())
})

let toFile = (filename, data) => co(function * () {
  let dirname = path.dirname(filename)
  yield mkdirpAsync(dirname)
  let dataString = JSON.stringify(data)
  yield writeFileAsync(filename, dataString)
})

/** @lends Storage */
class Storage extends EventEmitter {
  constructor (filename) {
    super()
    const s = this
    s.filename = filename
    s.hash = null
    s.memory = null
    s.needsFlush = false
  }

  /**
   * Read data
   * @returns {Promise}
   */
  read () {
    const s = this
    let { filename, memory } = s
    return co(function * () {
      let hash = yield fileHash(filename)
      let cached = !hash || (s.hash === hash)
      if (cached) {
        return memory
      }
      s.hash = hash

      let data = fromFile(filename)
      s.memory = data
      return data
    })
  }

  /**
   * Write data
   * @param data
   * @returns {*|Promise}
   */
  write (data) {
    const s = this
    let { filename } = s
    return co(function * () {
      s.memory = data
      s.hash = yield fileHash(filename)
      s.needsFlush = true
    })
  }

  /**
   * Save data into file system
   * @returns {Promise}
   */
  flush () {
    const s = this
    let { filename, memory } = s
    return co(function * () {
      yield toFile(filename, memory)
      s.hash = yield fileHash(filename)
    })
  }

  /**
   * Flush only if needed
   * @returns {Promise}
   */
  flushIfNeeded () {
    const s = this
    return co(function * () {
      if (s.needsFlush) {
        yield s.flush()
        s.emit('flush', { data: s.memory })
        s.needsFlush = false
      }
    })
  }

  /**
   * Purge data
   * @returns {Promise}
   */
  purge () {
    const s = this
    let { filename, memory } = s
    s.memory = null
    return co(function * () {
      let exists = yield existsAsync(filename)
      if (exists) {
        s.emit('purge', { filename, memory })
        yield unlinkAsync(filename)
      }
    })
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
