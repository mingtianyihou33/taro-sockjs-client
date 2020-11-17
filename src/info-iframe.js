import EventEmitter from './event/emitter'
import inherits from './utils/inherits'
import JSON3 from 'json3'
import utils from './utils/event'
import IframeTransport from './transport/iframe'
import InfoReceiverIframe from './info-iframe-receiver'
import debug from './utils/debug'

function InfoIframe(baseUrl, url) {
  let self = this
  EventEmitter.call(this)

  let go = function () {
    let ifr = (self.ifr = new IframeTransport(
      InfoReceiverIframe.transportName,
      url,
      baseUrl,
    ))

    ifr.once('message', function (msg) {
      if (msg) {
        let d
        try {
          d = JSON3.parse(msg)
        } catch (e) {
          debug('bad json', msg)
          self.emit('finish')
          self.close()
          return
        }

        let info = d[0],
          rtt = d[1]
        self.emit('finish', info, rtt)
      }
      self.close()
    })

    ifr.once('close', function () {
      self.emit('finish')
      self.close()
    })
  }

  // TODO this seems the same as the 'needBody' from transports
  if (!global.document.body) {
    utils.attachEvent('load', go)
  } else {
    go()
  }
}

inherits(InfoIframe, EventEmitter)

InfoIframe.enabled = function () {
  return IframeTransport.enabled()
}

InfoIframe.prototype.close = function () {
  if (this.ifr) {
    this.ifr.close()
  }
  this.removeAllListeners()
  this.ifr = null
}

export default InfoIframe
