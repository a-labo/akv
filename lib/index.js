/**
 * A simple key value store using single json file
 * @module akv
 */

'use strict'

const create = require('./create')
const AKV = require('./akv')

let lib = create.bind(this)

Object.assign(lib, AKV, {
  AKV,
  create
})

module.exports = lib
