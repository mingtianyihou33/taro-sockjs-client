export default {
  isObject: function (obj) {
    let type = typeof obj
    return type === 'function' || (type === 'object' && !!obj)
  },

  extend: function (obj) {
    if (!this.isObject(obj)) {
      return obj
    }
    let source, prop
    for (let i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i]
      for (prop in source) {
        if (Object.prototype.hasOwnProperty.call(source, prop)) {
          obj[prop] = source[prop]
        }
      }
    }
    return obj
  },
}
