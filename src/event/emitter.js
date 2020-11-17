import inherits from '../utils/inherits'
import EventTarget from './eventtarget'

function EventEmitter() {
  EventTarget.call(this)
}

inherits(EventEmitter, EventTarget)

EventEmitter.prototype.removeAllListeners = function (type) {
  if (type) {
    delete this._listeners[type]
  } else {
    this._listeners = {}
  }
}

EventEmitter.prototype.once = function (type, listener) {
  let self = this,
    fired = false

  function g() {
    self.removeListener(type, g)

    if (!fired) {
      fired = true
      listener.apply(this, arguments)
    }
  }

  this.on(type, g)
}

EventEmitter.prototype.emit = function () {
  let type = arguments[0]
  let listeners = this._listeners[type]
  if (!listeners) {
    return
  }
  // equivalent of Array.prototype.slice.call(arguments, 1);
  let l = arguments.length
  let args = new Array(l - 1)
  for (let ai = 1; ai < l; ai++) {
    args[ai - 1] = arguments[ai]
  }
  for (let i = 0; i < listeners.length; i++) {
    listeners[i].apply(this, args)
  }
}

EventEmitter.prototype.on = EventEmitter.prototype.addListener =
  EventTarget.prototype.addEventListener
EventEmitter.prototype.removeListener =
  EventTarget.prototype.removeEventListener

export default EventEmitter
