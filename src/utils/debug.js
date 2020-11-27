const debug = (function () {
  return process.env.NODE_ENV !== 'production'
    ? console.debug.bind(console)
    : function () {}
})()
export default debug
