/**
 * A simple key value store using single json file
 * @module akv
 */

'use strict'

let d = (module) => module.default || module

module.exports = {
  get fileHash () { return d(require('./file_hash')) },
  get readJsonFile () { return d(require('./read_json_file')) },
  get writeJsonFile () { return d(require('./write_json_file')) }
}
