import { EventEmitter } from 'events'
import inherits from 'inherits'
import JSON3 from 'json3'
import objectUtils from './utils/object'
let debug = function () {}

function InfoAjax(url, AjaxObject) {
  EventEmitter.call(this)

  let self = this
  let t0 = +new Date()
  this.xo = new AjaxObject('GET', url)

  this.xo.once('finish', function (status, text) {
    let info, rtt
    if (status === 200) {
      rtt = +new Date() - t0
      if (text) {
        try {
          info = JSON3.parse(text)
        } catch (e) {
          debug('bad json', text)
        }
      }

      if (!objectUtils.isObject(info)) {
        info = {}
      }
    }
    self.emit('finish', info, rtt)
    self.removeAllListeners()
  })
}

inherits(InfoAjax, EventEmitter)

InfoAjax.prototype.close = function () {
  this.removeAllListeners()
  this.xo.close()
}

export default InfoAjax
