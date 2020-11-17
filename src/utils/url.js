import URL from 'url-parse'
import debug from '../utils/debug'

export default {
  getOrigin: function (url) {
    if (!url) {
      return null
    }

    let p = new URL(url)
    if (p.protocol === 'file:') {
      return null
    }

    let port = p.port
    if (!port) {
      port = p.protocol === 'https:' ? '443' : '80'
    }

    return p.protocol + '//' + p.hostname + ':' + port
  },

  isOriginEqual: function (a, b) {
    let res = this.getOrigin(a) === this.getOrigin(b)
    debug('same', a, b, res)
    return res
  },

  isSchemeEqual: function (a, b) {
    return a.split(':')[0] === b.split(':')[0]
  },

  addPath: function (url, path) {
    let qs = url.split('?')
    return qs[0] + path + (qs[1] ? '?' + qs[1] : '')
  },

  addQuery: function (url, q) {
    return url + (url.indexOf('?') === -1 ? '?' + q : '&' + q)
  },

  isLoopbackAddr: function (addr) {
    return (
      /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) ||
      /^\[::1\]$/.test(addr)
    )
  },
}
