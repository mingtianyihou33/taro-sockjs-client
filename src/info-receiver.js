import EventEmitter from './event/emitter'
import inherits from './utils/inherits'
import urlUtils from './utils/url'
import XDR from './transport/sender/xdr'
import XHRCors from './transport/sender/xhr-cors'
import XHRLocal from './transport/sender/xhr-local'
import XHRFake from './transport/sender/xhr-fake'
import InfoAjax from './info-ajax'
let debug = function () {}

function InfoReceiver(baseUrl, urlInfo) {
  debug(baseUrl)
  let self = this
  EventEmitter.call(this)

  setTimeout(function () {
    self.doXhr(baseUrl, urlInfo)
  }, 0)
}

inherits(InfoReceiver, EventEmitter)

// TODO this is currently ignoring the list of available transports and the whitelist

InfoReceiver._getReceiver = function (baseUrl, url, urlInfo) {
  // determine method of CORS support (if needed)
  if (urlInfo.sameOrigin) {
    return new InfoAjax(url, XHRLocal)
  }
  if (XHRCors.enabled) {
    return new InfoAjax(url, XHRCors)
  }
  if (XDR.enabled && urlInfo.sameScheme) {
    return new InfoAjax(url, XDR)
  }
  return new InfoAjax(url, XHRFake)
}

InfoReceiver.prototype.doXhr = function (baseUrl, urlInfo) {
  let self = this,
    url = urlUtils.addPath(baseUrl, '/info')
  debug('doXhr', url)

  this.xo = InfoReceiver._getReceiver(baseUrl, url, urlInfo)

  this.timeoutRef = setTimeout(function () {
    debug('timeout')
    self._cleanup(false)
    self.emit('finish')
  }, InfoReceiver.timeout)

  this.xo.once('finish', function (info, rtt) {
    debug('finish', info, rtt)
    self._cleanup(true)
    self.emit('finish', info, rtt)
  })
}

InfoReceiver.prototype._cleanup = function (wasClean) {
  debug('_cleanup')
  clearTimeout(this.timeoutRef)
  this.timeoutRef = null
  if (!wasClean && this.xo) {
    this.xo.close()
  }
  this.xo = null
}

InfoReceiver.prototype.close = function () {
  debug('close')
  this.removeAllListeners()
  this._cleanup(false)
}

InfoReceiver.timeout = 8000

export default InfoReceiver
