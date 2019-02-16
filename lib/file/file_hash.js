/**
 * Create hash from file hash
 * @function fileHash
 * @param {string} filename - Filename to hash
 * @returns {Object} hash - Hash data
 */
'use strict'

const { crc32 } = require('crc')
const { existsAsync, statAsync } = require('asfs')

/** @lends fileHash */
async function fileHash(filename) {
  let stat = (await existsAsync(filename)) && (await statAsync(filename))
  if (!stat) {
    return null
  }
  let dataString = JSON.stringify(stat, (k, v) => {
    let ignore = (k === 'atime')
    return ignore ? undefined : v
  })
  return crc32(dataString)
}

module.exports = fileHash
