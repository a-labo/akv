/**
 * @function writeJsonFile
 * @param {string} filename
 * @returns {Promise}
 */
'use strict'

const co = require('co')
const path = require('path')
const { mkdirpAsync, writeFileAsync } = require('asfs')

/** @lends writeJsonFile */
function writeJsonFile (filename, data) {
  return co(function * () {
    let dirname = path.dirname(filename)
    yield mkdirpAsync(dirname)
    let dataString = JSON.stringify(data)
    yield writeFileAsync(filename, dataString)
  })
}

module.exports = writeJsonFile