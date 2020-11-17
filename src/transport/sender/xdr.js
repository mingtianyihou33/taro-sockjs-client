import EventEmitter from '../../event/emitter'
import inherits from '../../utils/inherits'
import eventUtils from '../../utils/event'
import browser from '../../utils/browser'
import urlUtils from '../../utils/url'

var debug = function () {}
// References:
//   http://ajaxian.com/archives/100-line-ajax-wrapper
//   http://msdn.microsoft.com/en-us/library/cc288060(v=VS.85).aspx

function XDRObject(method, url, payload) {
  debug(method, url)
  var self = this
  EventEmitter.call(this)

  setTimeout(function () {
    self._start(method, url, payload)
  }, 0)
}

inherits(XDRObject, EventEmitter)

XDRObject.prototype._start = function (method, url, payload) {
  debug('_start')
  var self = this
  var xdr = new global.XDomainRequest()
  // IE caches even POSTs
  url = urlUtils.addQuery(url, 't=' + +new Date())

  xdr.onerror = function () {
    debug('onerror')
    self._error()
  }
  xdr.ontimeout = function () {
    debug('ontimeout')
    self._error()
  }
  xdr.onprogress = function () {
    debug('progress', xdr.responseText)
    self.emit('chunk', 200, xdr.responseText)
  }
  xdr.onload = function () {
    debug('load')
    self.emit('finish', 200, xdr.responseText)
    self._cleanup(false)
  }
  this.xdr = xdr
  this.unloadRef = eventUtils.unloadAdd(function () {
    self._cleanup(true)
  })
  try {
    // Fails with AccessDenied if port number is bogus
    this.xdr.open(method, url)
    if (this.timeout) {
      this.xdr.timeout = this.timeout
    }
    this.xdr.send(payload)
  } catch (x) {
    this._error()
  }
}

XDRObject.prototype._error = function () {
  this.emit('finish', 0, '')
  this._cleanup(false)
}

XDRObject.prototype._cleanup = function (abort) {
  debug('cleanup', abort)
  if (!this.xdr) {
    return
  }
  this.removeAllListeners()
  eventUtils.unloadDel(this.unloadRef)

  this.xdr.ontimeout = this.xdr.onerror = this.xdr.onprogress = this.xdr.onload = null
  if (abort) {
    try {
      this.xdr.abort()
    } catch (x) {
      // intentionally empty
    }
  }
  this.unloadRef = this.xdr = null
}

XDRObject.prototype.close = function () {
  debug('close')
  this._cleanup(true)
}

// IE 8/9 if the request target uses the same scheme - #79
XDRObject.enabled = !!(global.XDomainRequest && browser.hasDomain())

export default XDRObject
