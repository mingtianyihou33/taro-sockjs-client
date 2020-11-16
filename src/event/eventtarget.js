/* Simplified implementation of DOM2 EventTarget.
 *   http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
 */

function EventTarget() {
  this._listeners = {}
}

EventTarget.prototype.addEventListener = function (eventType, listener) {
  if (!(eventType in this._listeners)) {
    this._listeners[eventType] = []
  }
  let arr = this._listeners[eventType]
  // #4
  if (arr.indexOf(listener) === -1) {
    // Make a copy so as not to interfere with a current dispatchEvent.
    arr = arr.concat([listener])
  }
  this._listeners[eventType] = arr
}

EventTarget.prototype.removeEventListener = function (eventType, listener) {
  let arr = this._listeners[eventType]
  if (!arr) {
    return
  }
  let idx = arr.indexOf(listener)
  if (idx !== -1) {
    if (arr.length > 1) {
      // Make a copy so as not to interfere with a current dispatchEvent.
      this._listeners[eventType] = arr.slice(0, idx).concat(arr.slice(idx + 1))
    } else {
      delete this._listeners[eventType]
    }
    return
  }
}

EventTarget.prototype.dispatchEvent = function () {
  let event = arguments[0]
  let t = event.type
  // equivalent of Array.prototype.slice.call(arguments, 0);
  let args = arguments.length === 1 ? [event] : Array.apply(null, arguments)
  // TODO: This doesn't match the real behavior; per spec, onfoo get
  // their place in line from the /first/ time they're set from
  // non-null. Although WebKit bumps it to the end every time it's
  // set.
  if (this['on' + t]) {
    this['on' + t].apply(this, args)
  }
  if (t in this._listeners) {
    // Grab a reference to the listeners list. removeEventListener may alter the list.
    let listeners = this._listeners[t]
    for (let i = 0; i < listeners.length; i++) {
      listeners[i].apply(this, args)
    }
  }
}

export default EventTarget
