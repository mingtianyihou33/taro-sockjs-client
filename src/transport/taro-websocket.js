import Taro from '@tarojs/taro'
import utils from '../utils/event'
import urlUtils from '../utils/url'
import inherits from 'inherits'
import { EventEmitter } from 'events'

function WebsocketDriver(url, protocols, options) {
  return Taro.connectSocket({ url, protocols, ...options })
}
let debug = function () {}

async function WebSocketTransport(transUrl, ignore, options) {
  if (!WebSocketTransport.enabled()) {
    throw new Error('Transport created when disabled')
  }

  EventEmitter.call(this)
  debug('constructor', transUrl)

  let self = this
  let url = urlUtils.addPath(transUrl, '/websocket')
  if (url.slice(0, 5) === 'https') {
    url = 'wss' + url.slice(5)
  } else {
    url = 'ws' + url.slice(4)
  }
  this.url = url
  this.ws = await new WebsocketDriver(this.url, [], options)
  console.log('this.ws', this.ws)
  this.ws.onmessage = function (e) {
    debug('message event', e.data)
    self.emit('message', e.data)
  }
  // Firefox has an interesting bug. If a websocket connection is
  // created after onunload, it stays alive even when user
  // navigates away from the page. In such situation let's lie -
  // let's not open the ws connection at all. See:
  // https://github.com/sockjs/sockjs-client/issues/28
  // https://bugzilla.mozilla.org/show_bug.cgi?id=696085
  this.unloadRef = utils.unloadAdd(function () {
    debug('unload')
    self.ws.close()
  })
  this.ws.onclose = function (e) {
    debug('close event', e.code, e.reason)
    self.emit('close', e.code, e.reason)
    self._cleanup()
  }
  this.ws.onerror = function (e) {
    debug('error event', e)
    self.emit('close', 1006, 'WebSocket connection broken')
    self._cleanup()
  }
}

inherits(WebSocketTransport, EventEmitter)

WebSocketTransport.prototype.send = function (data) {
  let msg = '[' + data + ']'
  debug('send', msg)
  this.ws.send(msg)
}

WebSocketTransport.prototype.close = function () {
  debug('close')
  let ws = this.ws
  this._cleanup()
  if (ws) {
    ws.close()
  }
}

WebSocketTransport.prototype._cleanup = function () {
  debug('_cleanup')
  let ws = this.ws
  if (ws) {
    ws.onmessage = ws.onclose = ws.onerror = null
  }
  utils.unloadDel(this.unloadRef)
  this.unloadRef = this.ws = null
  this.removeAllListeners()
}

WebSocketTransport.enabled = function () {
  debug('enabled')
  return !!WebsocketDriver
}
WebSocketTransport.transportName = 'websocket'

// In theory, ws should require 1 round trip. But in chrome, this is
// not very stable over SSL. Most likely a ws connection requires a
// separate SSL connection, in which case 2 round trips are an
// absolute minumum.
WebSocketTransport.roundTrips = 2

export default WebSocketTransport
