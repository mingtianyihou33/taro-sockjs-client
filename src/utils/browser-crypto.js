if (global.crypto && global.crypto.getRandomValues) {
  module.exports.randomBytes = function (length) {
    let bytes = new Uint8Array(length)
    global.crypto.getRandomValues(bytes)
    return bytes
  }
} else {
  module.exports.randomBytes = function (length) {
    let bytes = new Array(length)
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256)
    }
    return bytes
  }
}
