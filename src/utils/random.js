import crypto from '../utils/browser-crypto'

// This string has length 32, a power of 2, so the modulus doesn't introduce a
// bias.
let _randomStringChars = 'abcdefghijklmnopqrstuvwxyz012345'
export default {
  string: function (length) {
    let max = _randomStringChars.length
    let bytes = crypto.randomBytes(length)
    let ret = []
    for (let i = 0; i < length; i++) {
      ret.push(_randomStringChars.substr(bytes[i] % max, 1))
    }
    return ret.join('')
  },

  number: function (max) {
    return Math.floor(Math.random() * max)
  },

  numberString: function (max) {
    let t = ('' + (max - 1)).length
    let p = new Array(t + 1).join('0')
    return (p + this.number(max)).slice(-t)
  },
}
