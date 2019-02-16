/**
 * @function writeToFile
 * @param {string} filename
 * @returns {Promise}
 */
'use strict'

const path = require('path')
const { mkdirpAsync, writeFileAsync } = require('asfs')

/** @lends writeToFile */
async function writeToFile(filename, data) {
  let dirname = path.dirname(filename)
  await mkdirpAsync(dirname)
  let dataString = JSON.stringify(data)
  await writeFileAsync(filename, dataString)
}

module.exports = writeToFile
