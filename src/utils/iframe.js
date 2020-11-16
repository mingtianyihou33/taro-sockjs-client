import eventUtils from './event'
import JSON3 from 'json3'
import browser from './browser'

let debug = function () {}

export default {
  WPrefix: '_jp',
  currentWindowId: null,
  iframeEnabled: false,
  polluteGlobalNamespace: function () {
    if (!(module.exports.WPrefix in global)) {
      global[module.exports.WPrefix] = {}
    }
  },

  postMessage: function (type, data) {
    if (global.parent !== global) {
      global.parent.postMessage(
        JSON3.stringify({
          windowId: module.exports.currentWindowId,
          type: type,
          data: data || '',
        }),
        '*',
      )
    } else {
      debug('Cannot postMessage, no parent window.', type, data)
    }
  },

  createIframe: function (iframeUrl, errorCallback) {
    let iframe = global.document.createElement('iframe')
    let tref, unloadRef
    let unattach = function () {
      debug('unattach')
      clearTimeout(tref)
      // Explorer had problems with that.
      try {
        iframe.onload = null
      } catch (x) {
        // intentionally empty
      }
      iframe.onerror = null
    }
    let cleanup = function () {
      debug('cleanup')
      if (iframe) {
        unattach()
        // This timeout makes chrome fire onbeforeunload event
        // within iframe. Without the timeout it goes straight to
        // onunload.
        setTimeout(function () {
          if (iframe) {
            iframe.parentNode.removeChild(iframe)
          }
          iframe = null
        }, 0)
        eventUtils.unloadDel(unloadRef)
      }
    }
    let onerror = function (err) {
      debug('onerror', err)
      if (iframe) {
        cleanup()
        errorCallback(err)
      }
    }
    let post = function (msg, origin) {
      debug('post', msg, origin)
      setTimeout(function () {
        try {
          // When the iframe is not loaded, IE raises an exception
          // on 'contentWindow'.
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(msg, origin)
          }
        } catch (x) {
          // intentionally empty
        }
      }, 0)
    }

    iframe.src = iframeUrl
    iframe.style.display = 'none'
    iframe.style.position = 'absolute'
    iframe.onerror = function () {
      onerror('onerror')
    }
    iframe.onload = function () {
      debug('onload')
      // `onload` is triggered before scripts on the iframe are
      // executed. Give it few seconds to actually load stuff.
      clearTimeout(tref)
      tref = setTimeout(function () {
        onerror('onload timeout')
      }, 2000)
    }
    global.document.body.appendChild(iframe)
    tref = setTimeout(function () {
      onerror('timeout')
    }, 15000)
    unloadRef = eventUtils.unloadAdd(cleanup)
    return {
      post: post,
      cleanup: cleanup,
      loaded: unattach,
    }
  },

  /* eslint no-undef: "off", new-cap: "off" */
  createHtmlfile: function (iframeUrl, errorCallback) {
    let axo = ['Active'].concat('Object').join('X')
    let doc = new global[axo]('htmlfile')
    let tref, unloadRef
    let iframe
    let unattach = function () {
      clearTimeout(tref)
      iframe.onerror = null
    }
    let cleanup = function () {
      if (doc) {
        unattach()
        eventUtils.unloadDel(unloadRef)
        iframe.parentNode.removeChild(iframe)
        iframe = doc = null
        CollectGarbage()
      }
    }
    let onerror = function (r) {
      debug('onerror', r)
      if (doc) {
        cleanup()
        errorCallback(r)
      }
    }
    let post = function (msg, origin) {
      try {
        // When the iframe is not loaded, IE raises an exception
        // on 'contentWindow'.
        setTimeout(function () {
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(msg, origin)
          }
        }, 0)
      } catch (x) {
        // intentionally empty
      }
    }

    doc.open()
    doc.write(
      '<html><s' +
        'cript>' +
        'document.domain="' +
        global.document.domain +
        '";' +
        '</s' +
        'cript></html>',
    )
    doc.close()
    doc.parentWindow[module.exports.WPrefix] = global[module.exports.WPrefix]
    let c = doc.createElement('div')
    doc.body.appendChild(c)
    iframe = doc.createElement('iframe')
    c.appendChild(iframe)
    iframe.src = iframeUrl
    iframe.onerror = function () {
      onerror('onerror')
    }
    tref = setTimeout(function () {
      onerror('timeout')
    }, 15000)
    unloadRef = eventUtils.unloadAdd(cleanup)
    return {
      post: post,
      cleanup: cleanup,
      loaded: unattach,
    }
  },
}
