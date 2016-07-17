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
const Queue = require('./queue')

/** @lends Storage */
class Storage extends EventEmitter {
  constructor (filename, data) {
    super()
    const s = this
    s.filename = filename
    s.stat = null
    s.hash = null
    s.cache = null

    s.readQueue = new Queue()
    s.writeQueue = new Queue()
  }

  read () {
    const s = this
    let { filename, readQueue, cache } = s
    return readQueue.call(() =>
      co(function * () {
        let exists = yield existsAsync(filename)
        if (!exists) {
          return null
        }
        let stat = yield statAsync(filename)
        let changed = (!s.stat) || (s.stat.mtime < stat.mtime) || (s.stat.size !== stat.size)
        if (changed) {
          s.invalidate()
        }
        s.stat = stat
        if (cache) {
          return cache
        }
        let dataString = yield readFileAsync(filename)
        let data = JSON.parse(dataString.toString())
        s.cache = data
        return data
      })
    )
  }

  write (data) {
    const s = this
    let { filename, writeQueue } = s
    return writeQueue.call(() =>
      co(function * doWrite () {
        yield mkdirpAsync(path.dirname(filename))
        let dataString = JSON.stringify(data, null, 2)
        let hash = crc32(dataString)
        let changed = hash !== s.hash
        if (changed) {
          yield writeFileAsync(filename, dataString)
        }
        s.hash = hash
        s.invalidate()
      })
    )
  }

  unlink () {
    const s = this
    let { filename } = s
    s.cache = null
    return co(function * () {
      yield unlinkAsync(filename)
    })
  }

  invalidate () {
    const s = this
    s.cache = null
  }
}

module.exports = Storage
