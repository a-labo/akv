/**
 * Read a json file
 * @function readJsonFile
 * @param {string} filename - File name to read
 * @returns {Promise.<Object>} - Data json file
 */
'use strict'

const co = require('co')
const { existsAsync, readFileAsync } = require('asfs')

/** @lends readJsonFile */
function readJsonFile (filename) {
  return co(function * () {
    let exists = yield existsAsync(filename)
    if (!exists) {
      return null
    }
    return JSON.parse((yield readFileAsync(filename)).toString())
  })
}

module.exports = readJsonFile
