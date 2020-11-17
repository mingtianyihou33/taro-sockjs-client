function randomBytes(length) {
  let bytes = new Array(length)
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256)
  }
  return bytes
}
export default { randomBytes }
