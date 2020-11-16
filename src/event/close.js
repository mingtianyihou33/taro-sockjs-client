import inherits from 'inherits'
import Event from './event'
function CloseEvent() {
  Event.call(this)
  this.initEvent('close', false, false)
  this.wasClean = false
  this.code = 0
  this.reason = ''
}

inherits(CloseEvent, Event)

export default CloseEvent
