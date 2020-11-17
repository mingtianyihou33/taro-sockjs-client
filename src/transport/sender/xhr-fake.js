import EventEmitter from '../../event/emitter'
import inherits from '../../utils/inherits'

function XHRFake(/* method, url, payload, opts */) {
  let self = this
  EventEmitter.call(this)

  this.to = setTimeout(function () {
    self.emit('finish', 200, '{}')
  }, XHRFake.timeout)
}

inherits(XHRFake, EventEmitter)

XHRFake.prototype.close = function () {
  clearTimeout(this.to)
}

XHRFake.timeout = 2000

export default XHRFake
