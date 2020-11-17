import inherits from './utils/inherits'
import EventEmitter from './event/emitter'
import JSON3 from 'json3'
import XHRLocalObject from './transport/sender/xhr-local'
import InfoAjax from './info-ajax'

function InfoReceiverIframe(transUrl) {
  let self = this
  EventEmitter.call(this)

  this.ir = new InfoAjax(transUrl, XHRLocalObject)
  this.ir.once('finish', function (info, rtt) {
    self.ir = null
    self.emit('message', JSON3.stringify([info, rtt]))
  })
}

inherits(InfoReceiverIframe, EventEmitter)

InfoReceiverIframe.transportName = 'iframe-info-receiver'

InfoReceiverIframe.prototype.close = function () {
  if (this.ir) {
    this.ir.close()
    this.ir = null
  }
  this.removeAllListeners()
}

export default InfoReceiverIframe
