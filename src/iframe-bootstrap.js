import urlUtils from './utils/url'
import eventUtils from './utils/event'
import JSON3 from 'json3'
import FacadeJS from './facade'
import InfoIframeReceiver from './info-iframe-receiver'
import iframeUtils from './utils/iframe'
import loc from './location'
import debug from './utils/debug'

export default function (SockJS, availableTransports) {
  let transportMap = {}
  availableTransports.forEach(function (at) {
    if (at.facadeTransport) {
      transportMap[at.facadeTransport.transportName] = at.facadeTransport
    }
  })

  // hard-coded for the info iframe
  // TODO see if we can make this more dynamic
  transportMap[InfoIframeReceiver.transportName] = InfoIframeReceiver
  let parentOrigin

  /* eslint-disable camelcase */
  SockJS.bootstrap_iframe = function () {
    /* eslint-enable camelcase */
    let facade
    iframeUtils.currentWindowId = loc.hash.slice(1)
    let onMessage = function (e) {
      if (e.source !== parent) {
        return
      }
      if (typeof parentOrigin === 'undefined') {
        parentOrigin = e.origin
      }
      if (e.origin !== parentOrigin) {
        return
      }

      let iframeMessage
      try {
        iframeMessage = JSON3.parse(e.data)
      } catch (ignored) {
        debug('bad json', e.data)
        return
      }

      if (iframeMessage.windowId !== iframeUtils.currentWindowId) {
        return
      }
      switch (iframeMessage.type) {
        case 's':
          let p
          try {
            p = JSON3.parse(iframeMessage.data)
          } catch (ignored) {
            debug('bad json', iframeMessage.data)
            break
          }
          let version = p[0]
          let transport = p[1]
          let transUrl = p[2]
          let baseUrl = p[3]
          debug(version, transport, transUrl, baseUrl)
          // change this to semver logic
          if (version !== SockJS.version) {
            throw new Error(
              'Incompatible SockJS! Main site uses:' +
                ' "' +
                version +
                '", the iframe:' +
                ' "' +
                SockJS.version +
                '".',
            )
          }

          if (
            !urlUtils.isOriginEqual(transUrl, loc.href) ||
            !urlUtils.isOriginEqual(baseUrl, loc.href)
          ) {
            throw new Error(
              "Can't connect to different domain from within an " +
                'iframe. (' +
                loc.href +
                ', ' +
                transUrl +
                ', ' +
                baseUrl +
                ')',
            )
          }
          facade = new FacadeJS(new transportMap[transport](transUrl, baseUrl))
          break
        case 'm':
          facade._send(iframeMessage.data)
          break
        case 'c':
          if (facade) {
            facade._close()
          }
          facade = null
          break
      }
    }

    eventUtils.attachEvent('message', onMessage)

    // Start
    iframeUtils.postMessage('s')
  }
}
