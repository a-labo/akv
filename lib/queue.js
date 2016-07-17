/**
 * Serial task queue
 * @class Queue
 */
'use strict'

/** @lends Queue */
class Queue {
  constructor () {
    const s = this
    s._queue = []
    s._working = null

    setInterval(() => {
      if (s._working) {
        return
      }
      let entry = s._queue.shift()
      if (!entry) {
        return
      }
      s._working = entry
      let { task, resolve, reject } = entry
      Promise.resolve(task())
        .then(resolve, reject)
        .then(() => { s._working = null })
        .catch(() => { s._working = null })
    }, 0).unref()
  }

  call (task) {
    const s = this
    return new Promise((resolve, reject) => {
      s._queue.push({
        task, resolve, reject
      })
    })
  }

}

module.exports = Queue
