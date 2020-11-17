import EventEmitter from '../../event/emitter'
import inherits from '../../utils/inherits'
import URL from 'url-parse'
const http = require('http')
const https = require('https')
let debug = function () {}

function XhrDriver(method, url, payload, opts) {
  debug(method, url, payload)
  let self = this
  EventEmitter.call(this)

  let parsedUrl = new URL(url)
  let options = {
    method: method,
    hostname: parsedUrl.hostname.replace(/\[|\]/g, ''),
    port: parsedUrl.port,
    path: parsedUrl.pathname + (parsedUrl.query || ''),
    headers: opts && opts.headers,
    agent: false,
  }

  let protocol = parsedUrl.protocol === 'https:' ? https : http
  this.req = protocol.request(options, function (res) {
    res.setEncoding('utf8')
    let responseText = ''

    res.on('data', function (chunk) {
      debug('data', chunk)
      responseText += chunk
      self.emit('chunk', 200, responseText)
    })
    res.once('end', function () {
      debug('end')
      self.emit('finish', res.statusCode, responseText)
      self.req = null
    })
  })

  this.req.on('error', function (e) {
    debug('error', e)
    self.emit('finish', 0, e.message)
  })

  if (payload) {
    this.req.write(payload)
  }
  this.req.end()
}

inherits(XhrDriver, EventEmitter)

XhrDriver.prototype.close = function () {
  debug('close')
  this.removeAllListeners()
  if (this.req) {
    this.req.abort()
    this.req = null
  }
}

XhrDriver.enabled = true
XhrDriver.supportsCORS = true

export default XhrDriver
