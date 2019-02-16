/**
 * Read a json file
 * @function readFromFile
 * @param {string} filename - File name to read
 * @returns {Promise.<Object>} - Data json file
 */
'use strict'

const { existsAsync, readFileAsync } = require('asfs')

/** @lends readFromFile */
async function readFromFile(filename) {
  let exists = await existsAsync(filename)
  if (!exists) {
    return null
  }
  let content = (await readFileAsync(filename)).toString()
  if (!content) {
    return null
  }
  return JSON.parse(content)
}

module.exports = readFromFile
