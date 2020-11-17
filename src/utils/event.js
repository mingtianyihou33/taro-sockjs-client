import random from './random'

let onUnload = {},
  afterUnload = false,
  // detect google chrome packaged apps because they don't allow the 'unload' event
  isChromePackagedApp =
    global.chrome && global.chrome.app && global.chrome.app.runtime
export default {
  attachEvent: function (event, listener) {
    if (typeof global.addEventListener !== 'undefined') {
      global.addEventListener(event, listener, false)
    } else if (global.document && global.attachEvent) {
      // IE quirks.
      // According to: http://stevesouders.com/misc/test-postmessage.php
      // the message gets delivered only to 'document', not 'window'.
      global.document.attachEvent('on' + event, listener)
      // I get 'window' for ie8.
      global.attachEvent('on' + event, listener)
    }
  },

  detachEvent: function (event, listener) {
    if (typeof global.addEventListener !== 'undefined') {
      global.removeEventListener(event, listener, false)
    } else if (global.document && global.detachEvent) {
      global.document.detachEvent('on' + event, listener)
      global.detachEvent('on' + event, listener)
    }
  },

  unloadAdd: function (listener) {
    if (isChromePackagedApp) {
      return null
    }

    let ref = random.string(8)
    onUnload[ref] = listener
    if (afterUnload) {
      setTimeout(this.triggerUnloadCallbacks, 0)
    }
    return ref
  },

  unloadDel: function (ref) {
    if (ref in onUnload) {
      delete onUnload[ref]
    }
  },

  triggerUnloadCallbacks: function () {
    for (let ref in onUnload) {
      onUnload[ref]()
      delete onUnload[ref]
    }
  },
}
