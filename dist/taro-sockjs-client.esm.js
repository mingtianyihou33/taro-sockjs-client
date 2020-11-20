import Taro from '@tarojs/taro';

function randomBytes(length) {
  let bytes = new Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }

  return bytes;
}

var crypto = {
  randomBytes
};

// bias.

let _randomStringChars = 'abcdefghijklmnopqrstuvwxyz012345';
var random = {
  string: function (length) {
    let max = _randomStringChars.length;
    let bytes = crypto.randomBytes(length);
    let ret = [];

    for (let i = 0; i < length; i++) {
      ret.push(_randomStringChars.substr(bytes[i] % max, 1));
    }

    return ret.join('');
  },
  number: function (max) {
    return Math.floor(Math.random() * max);
  },
  numberString: function (max) {
    let t = ('' + (max - 1)).length;
    let p = new Array(t + 1).join('0');
    return (p + this.number(max)).slice(-t);
  }
};

let onUnload = {},
    // detect google chrome packaged apps because they don't allow the 'unload' event
isChromePackagedApp = global.chrome && global.chrome.app && global.chrome.app.runtime;
var eventUtils = {
  attachEvent: function (event, listener) {
    if (typeof global.addEventListener !== 'undefined') {
      global.addEventListener(event, listener, false);
    } else if (global.document && global.attachEvent) {
      // IE quirks.
      // According to: http://stevesouders.com/misc/test-postmessage.php
      // the message gets delivered only to 'document', not 'window'.
      global.document.attachEvent('on' + event, listener); // I get 'window' for ie8.

      global.attachEvent('on' + event, listener);
    }
  },
  detachEvent: function (event, listener) {
    if (typeof global.addEventListener !== 'undefined') {
      global.removeEventListener(event, listener, false);
    } else if (global.document && global.detachEvent) {
      global.document.detachEvent('on' + event, listener);
      global.detachEvent('on' + event, listener);
    }
  },
  unloadAdd: function (listener) {
    if (isChromePackagedApp) {
      return null;
    }

    let ref = random.string(8);
    onUnload[ref] = listener;

    return ref;
  },
  unloadDel: function (ref) {
    if (ref in onUnload) {
      delete onUnload[ref];
    }
  },
  triggerUnloadCallbacks: function () {
    for (let ref in onUnload) {
      onUnload[ref]();
      delete onUnload[ref];
    }
  }
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, basedir, module) {
	return module = {
		path: basedir,
		exports: {},
		require: function (path, base) {
			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
		}
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

/**
 * Check if we're required to add a port number.
 *
 * @see https://url.spec.whatwg.org/#default-port
 * @param {Number|String} port Port number we need to check
 * @param {String} protocol Protocol we need to check against.
 * @returns {Boolean} Is it a default port for the given protocol
 * @api private
 */
var requiresPort = function required(port, protocol) {
  protocol = protocol.split(':')[0];
  port = +port;

  if (!port) return false;

  switch (protocol) {
    case 'http':
    case 'ws':
    return port !== 80;

    case 'https':
    case 'wss':
    return port !== 443;

    case 'ftp':
    return port !== 21;

    case 'gopher':
    return port !== 70;

    case 'file':
    return false;
  }

  return port !== 0;
};

var has = Object.prototype.hasOwnProperty
  , undef;

/**
 * Decode a URI encoded string.
 *
 * @param {String} input The URI encoded string.
 * @returns {String|Null} The decoded string.
 * @api private
 */
function decode(input) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch (e) {
    return null;
  }
}

/**
 * Attempts to encode a given input.
 *
 * @param {String} input The string that needs to be encoded.
 * @returns {String|Null} The encoded string.
 * @api private
 */
function encode(input) {
  try {
    return encodeURIComponent(input);
  } catch (e) {
    return null;
  }
}

/**
 * Simple query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object}
 * @api public
 */
function querystring(query) {
  var parser = /([^=?#&]+)=?([^&]*)/g
    , result = {}
    , part;

  while (part = parser.exec(query)) {
    var key = decode(part[1])
      , value = decode(part[2]);

    //
    // Prevent overriding of existing properties. This ensures that build-in
    // methods like `toString` or __proto__ are not overriden by malicious
    // querystrings.
    //
    // In the case if failed decoding, we want to omit the key/value pairs
    // from the result.
    //
    if (key === null || value === null || key in result) continue;
    result[key] = value;
  }

  return result;
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix) {
  prefix = prefix || '';

  var pairs = []
    , value
    , key;

  //
  // Optionally prefix with a '?' if needed
  //
  if ('string' !== typeof prefix) prefix = '?';

  for (key in obj) {
    if (has.call(obj, key)) {
      value = obj[key];

      //
      // Edge cases where we actually want to encode the value to an empty
      // string instead of the stringified value.
      //
      if (!value && (value === null || value === undef || isNaN(value))) {
        value = '';
      }

      key = encode(key);
      value = encode(value);

      //
      // If we failed to encode the strings, we should bail out as we don't
      // want to add invalid strings to the query.
      //
      if (key === null || value === null) continue;
      pairs.push(key +'='+ value);
    }
  }

  return pairs.length ? prefix + pairs.join('&') : '';
}

//
// Expose the module.
//
var stringify = querystringify;
var parse = querystring;

var querystringify_1 = {
	stringify: stringify,
	parse: parse
};

var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
  , whitespace = '[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]'
  , left = new RegExp('^'+ whitespace +'+');

/**
 * Trim a given string.
 *
 * @param {String} str String to trim.
 * @public
 */
function trimLeft(str) {
  return (str ? str : '').toString().replace(left, '');
}

/**
 * These are the parse rules for the URL parser, it informs the parser
 * about:
 *
 * 0. The char it Needs to parse, if it's a string it should be done using
 *    indexOf, RegExp using exec and NaN means set as current value.
 * 1. The property we should set when parsing this value.
 * 2. Indication if it's backwards or forward parsing, when set as number it's
 *    the value of extra chars that should be split off.
 * 3. Inherit from location if non existing in the parser.
 * 4. `toLowerCase` the resulting value.
 */
var rules = [
  ['#', 'hash'],                        // Extract from the back.
  ['?', 'query'],                       // Extract from the back.
  function sanitize(address) {          // Sanitize what is left of the address
    return address.replace('\\', '/');
  },
  ['/', 'pathname'],                    // Extract from the back.
  ['@', 'auth', 1],                     // Extract from the front.
  [NaN, 'host', undefined, 1, 1],       // Set left over value.
  [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
];

/**
 * These properties should not be copied or inherited from. This is only needed
 * for all non blob URL's as a blob URL does not include a hash, only the
 * origin.
 *
 * @type {Object}
 * @private
 */
var ignore = { hash: 1, query: 1 };

/**
 * The location object differs when your code is loaded through a normal page,
 * Worker or through a worker using a blob. And with the blobble begins the
 * trouble as the location object will contain the URL of the blob, not the
 * location of the page where our code is loaded in. The actual origin is
 * encoded in the `pathname` so we can thankfully generate a good "default"
 * location from it so we can generate proper relative URL's again.
 *
 * @param {Object|String} loc Optional default location object.
 * @returns {Object} lolcation object.
 * @public
 */
function lolcation(loc) {
  var globalVar;

  if (typeof window !== 'undefined') globalVar = window;
  else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;
  else if (typeof self !== 'undefined') globalVar = self;
  else globalVar = {};

  var location = globalVar.location || {};
  loc = loc || location;

  var finaldestination = {}
    , type = typeof loc
    , key;

  if ('blob:' === loc.protocol) {
    finaldestination = new Url(unescape(loc.pathname), {});
  } else if ('string' === type) {
    finaldestination = new Url(loc, {});
    for (key in ignore) delete finaldestination[key];
  } else if ('object' === type) {
    for (key in loc) {
      if (key in ignore) continue;
      finaldestination[key] = loc[key];
    }

    if (finaldestination.slashes === undefined) {
      finaldestination.slashes = slashes.test(loc.href);
    }
  }

  return finaldestination;
}

/**
 * @typedef ProtocolExtract
 * @type Object
 * @property {String} protocol Protocol matched in the URL, in lowercase.
 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
 * @property {String} rest Rest of the URL that is not part of the protocol.
 */

/**
 * Extract protocol information from a URL with/without double slash ("//").
 *
 * @param {String} address URL we want to extract from.
 * @return {ProtocolExtract} Extracted information.
 * @private
 */
function extractProtocol(address) {
  address = trimLeft(address);
  var match = protocolre.exec(address);

  return {
    protocol: match[1] ? match[1].toLowerCase() : '',
    slashes: !!match[2],
    rest: match[3]
  };
}

/**
 * Resolve a relative URL pathname against a base URL pathname.
 *
 * @param {String} relative Pathname of the relative URL.
 * @param {String} base Pathname of the base URL.
 * @return {String} Resolved pathname.
 * @private
 */
function resolve(relative, base) {
  if (relative === '') return base;

  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
    , i = path.length
    , last = path[i - 1]
    , unshift = false
    , up = 0;

  while (i--) {
    if (path[i] === '.') {
      path.splice(i, 1);
    } else if (path[i] === '..') {
      path.splice(i, 1);
      up++;
    } else if (up) {
      if (i === 0) unshift = true;
      path.splice(i, 1);
      up--;
    }
  }

  if (unshift) path.unshift('');
  if (last === '.' || last === '..') path.push('');

  return path.join('/');
}

/**
 * The actual URL instance. Instead of returning an object we've opted-in to
 * create an actual constructor as it's much more memory efficient and
 * faster and it pleases my OCD.
 *
 * It is worth noting that we should not use `URL` as class name to prevent
 * clashes with the global URL instance that got introduced in browsers.
 *
 * @constructor
 * @param {String} address URL we want to parse.
 * @param {Object|String} [location] Location defaults for relative paths.
 * @param {Boolean|Function} [parser] Parser for the query string.
 * @private
 */
function Url(address, location, parser) {
  address = trimLeft(address);

  if (!(this instanceof Url)) {
    return new Url(address, location, parser);
  }

  var relative, extracted, parse, instruction, index, key
    , instructions = rules.slice()
    , type = typeof location
    , url = this
    , i = 0;

  //
  // The following if statements allows this module two have compatibility with
  // 2 different API:
  //
  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
  //    where the boolean indicates that the query string should also be parsed.
  //
  // 2. The `URL` interface of the browser which accepts a URL, object as
  //    arguments. The supplied object will be used as default values / fall-back
  //    for relative paths.
  //
  if ('object' !== type && 'string' !== type) {
    parser = location;
    location = null;
  }

  if (parser && 'function' !== typeof parser) parser = querystringify_1.parse;

  location = lolcation(location);

  //
  // Extract protocol information before running the instructions.
  //
  extracted = extractProtocol(address || '');
  relative = !extracted.protocol && !extracted.slashes;
  url.slashes = extracted.slashes || relative && location.slashes;
  url.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  //
  // When the authority component is absent the URL starts with a path
  // component.
  //
  if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];

  for (; i < instructions.length; i++) {
    instruction = instructions[i];

    if (typeof instruction === 'function') {
      address = instruction(address);
      continue;
    }

    parse = instruction[0];
    key = instruction[1];

    if (parse !== parse) {
      url[key] = address;
    } else if ('string' === typeof parse) {
      if (~(index = address.indexOf(parse))) {
        if ('number' === typeof instruction[2]) {
          url[key] = address.slice(0, index);
          address = address.slice(index + instruction[2]);
        } else {
          url[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if ((index = parse.exec(address))) {
      url[key] = index[1];
      address = address.slice(0, index.index);
    }

    url[key] = url[key] || (
      relative && instruction[3] ? location[key] || '' : ''
    );

    //
    // Hostname, host and protocol should be lowercased so they can be used to
    // create a proper `origin`.
    //
    if (instruction[4]) url[key] = url[key].toLowerCase();
  }

  //
  // Also parse the supplied query string in to an object. If we're supplied
  // with a custom parser as function use that instead of the default build-in
  // parser.
  //
  if (parser) url.query = parser(url.query);

  //
  // If the URL is relative, resolve the pathname against the base URL.
  //
  if (
      relative
    && location.slashes
    && url.pathname.charAt(0) !== '/'
    && (url.pathname !== '' || location.pathname !== '')
  ) {
    url.pathname = resolve(url.pathname, location.pathname);
  }

  //
  // We should not add port numbers if they are already the default port number
  // for a given protocol. As the host also contains the port number we're going
  // override it with the hostname which contains no port number.
  //
  if (!requiresPort(url.port, url.protocol)) {
    url.host = url.hostname;
    url.port = '';
  }

  //
  // Parse down the `auth` for the username and password.
  //
  url.username = url.password = '';
  if (url.auth) {
    instruction = url.auth.split(':');
    url.username = instruction[0] || '';
    url.password = instruction[1] || '';
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? url.protocol +'//'+ url.host
    : 'null';

  //
  // The href is just the compiled result.
  //
  url.href = url.toString();
}

/**
 * This is convenience method for changing properties in the URL instance to
 * insure that they all propagate correctly.
 *
 * @param {String} part          Property we need to adjust.
 * @param {Mixed} value          The newly assigned value.
 * @param {Boolean|Function} fn  When setting the query, it will be the function
 *                               used to parse the query.
 *                               When setting the protocol, double slash will be
 *                               removed from the final url if it is true.
 * @returns {URL} URL instance for chaining.
 * @public
 */
function set(part, value, fn) {
  var url = this;

  switch (part) {
    case 'query':
      if ('string' === typeof value && value.length) {
        value = (fn || querystringify_1.parse)(value);
      }

      url[part] = value;
      break;

    case 'port':
      url[part] = value;

      if (!requiresPort(value, url.protocol)) {
        url.host = url.hostname;
        url[part] = '';
      } else if (value) {
        url.host = url.hostname +':'+ value;
      }

      break;

    case 'hostname':
      url[part] = value;

      if (url.port) value += ':'+ url.port;
      url.host = value;
      break;

    case 'host':
      url[part] = value;

      if (/:\d+$/.test(value)) {
        value = value.split(':');
        url.port = value.pop();
        url.hostname = value.join(':');
      } else {
        url.hostname = value;
        url.port = '';
      }

      break;

    case 'protocol':
      url.protocol = value.toLowerCase();
      url.slashes = !fn;
      break;

    case 'pathname':
    case 'hash':
      if (value) {
        var char = part === 'pathname' ? '/' : '#';
        url[part] = value.charAt(0) !== char ? char + value : value;
      } else {
        url[part] = value;
      }
      break;

    default:
      url[part] = value;
  }

  for (var i = 0; i < rules.length; i++) {
    var ins = rules[i];

    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
  }

  url.origin = url.protocol && url.host && url.protocol !== 'file:'
    ? url.protocol +'//'+ url.host
    : 'null';

  url.href = url.toString();

  return url;
}

/**
 * Transform the properties back in to a valid and full URL string.
 *
 * @param {Function} stringify Optional query stringify function.
 * @returns {String} Compiled version of the URL.
 * @public
 */
function toString(stringify) {
  if (!stringify || 'function' !== typeof stringify) stringify = querystringify_1.stringify;

  var query
    , url = this
    , protocol = url.protocol;

  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  var result = protocol + (url.slashes ? '//' : '');

  if (url.username) {
    result += url.username;
    if (url.password) result += ':'+ url.password;
    result += '@';
  }

  result += url.host + url.pathname;

  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

  if (url.hash) result += url.hash;

  return result;
}

Url.prototype = { set: set, toString: toString };

//
// Expose the URL parser and some additional properties that might be useful for
// others or testing.
//
Url.extractProtocol = extractProtocol;
Url.location = lolcation;
Url.trimLeft = trimLeft;
Url.qs = querystringify_1;

var urlParse = Url;

function debug (...args) {
  if (process.env.NODE_ENV !== 'production') {
    console.debug(...args);
  }
}

var urlUtils = {
  getOrigin: function (url) {
    if (!url) {
      return null;
    }

    let p = new urlParse(url);

    if (p.protocol === 'file:') {
      return null;
    }

    let port = p.port;

    if (!port) {
      port = p.protocol === 'https:' ? '443' : '80';
    }

    return p.protocol + '//' + p.hostname + ':' + port;
  },
  isOriginEqual: function (a, b) {
    let res = this.getOrigin(a) === this.getOrigin(b);
    debug('same', a, b, res);
    return res;
  },
  isSchemeEqual: function (a, b) {
    return a.split(':')[0] === b.split(':')[0];
  },
  addPath: function (url, path) {
    let qs = url.split('?');
    return qs[0] + path + (qs[1] ? '?' + qs[1] : '');
  },
  addQuery: function (url, q) {
    return url + (url.indexOf('?') === -1 ? '?' + q : '&' + q);
  },
  isLoopbackAddr: function (addr) {
    return /^127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/i.test(addr) || /^\[::1\]$/.test(addr);
  }
};

function inherits(ctor, superCtor) {
  if (superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  }
}

/* Simplified implementation of DOM2 EventTarget.
 *   http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget
 */
function EventTarget() {
  this._listeners = {};
}

EventTarget.prototype.addEventListener = function (eventType, listener) {
  if (!(eventType in this._listeners)) {
    this._listeners[eventType] = [];
  }

  let arr = this._listeners[eventType]; // #4

  if (arr.indexOf(listener) === -1) {
    // Make a copy so as not to interfere with a current dispatchEvent.
    arr = arr.concat([listener]);
  }

  this._listeners[eventType] = arr;
};

EventTarget.prototype.removeEventListener = function (eventType, listener) {
  let arr = this._listeners[eventType];

  if (!arr) {
    return;
  }

  let idx = arr.indexOf(listener);

  if (idx !== -1) {
    if (arr.length > 1) {
      // Make a copy so as not to interfere with a current dispatchEvent.
      this._listeners[eventType] = arr.slice(0, idx).concat(arr.slice(idx + 1));
    } else {
      delete this._listeners[eventType];
    }

    return;
  }
};

EventTarget.prototype.dispatchEvent = function () {
  let event = arguments[0];
  let t = event.type; // equivalent of Array.prototype.slice.call(arguments, 0);

  let args = arguments.length === 1 ? [event] : Array.apply(null, arguments); // TODO: This doesn't match the real behavior; per spec, onfoo get
  // their place in line from the /first/ time they're set from
  // non-null. Although WebKit bumps it to the end every time it's
  // set.

  if (this['on' + t]) {
    this['on' + t].apply(this, args);
  }

  if (t in this._listeners) {
    // Grab a reference to the listeners list. removeEventListener may alter the list.
    let listeners = this._listeners[t];

    for (let i = 0; i < listeners.length; i++) {
      listeners[i].apply(this, args);
    }
  }
};

function EventEmitter() {
  EventTarget.call(this);
}

inherits(EventEmitter, EventTarget);

EventEmitter.prototype.removeAllListeners = function (type) {
  if (type) {
    delete this._listeners[type];
  } else {
    this._listeners = {};
  }
};

EventEmitter.prototype.once = function (type, listener) {
  let self = this,
      fired = false;

  function g() {
    self.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  this.on(type, g);
};

EventEmitter.prototype.emit = function () {
  let type = arguments[0];
  let listeners = this._listeners[type];

  if (!listeners) {
    return;
  } // equivalent of Array.prototype.slice.call(arguments, 1);


  let l = arguments.length;
  let args = new Array(l - 1);

  for (let ai = 1; ai < l; ai++) {
    args[ai - 1] = arguments[ai];
  }

  for (let i = 0; i < listeners.length; i++) {
    listeners[i].apply(this, args);
  }
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener = EventTarget.prototype.addEventListener;
EventEmitter.prototype.removeListener = EventTarget.prototype.removeEventListener;

function WebsocketDriver(url, protocols, options) {
  return Taro.connectSocket({
    url,
    protocols,
    ...options
  });
}

async function TaroWebSocketTransport(transUrl, ignore, options) {
  if (!TaroWebSocketTransport.enabled()) {
    throw new Error('Transport created when disabled');
  }

  EventEmitter.call(this);
  debug('constructor', transUrl);
  let self = this;
  let url = urlUtils.addPath(transUrl, '/websocket');

  if (url.slice(0, 5) === 'https') {
    url = 'wss' + url.slice(5);
  } else {
    url = 'ws' + url.slice(4);
  }

  this.url = url;
  this.ws = await new WebsocketDriver(this.url, [], options);
  this.ws.onMessage(function (e) {
    debug('message event', e.data);
    self.emit('message', e.data);
  }); // Firefox has an interesting bug. If a websocket connection is
  // created after onunload, it stays alive even when user
  // navigates away from the page. In such situation let's lie -
  // let's not open the ws connection at all. See:
  // https://github.com/sockjs/sockjs-client/issues/28
  // https://bugzilla.mozilla.org/show_bug.cgi?id=696085

  this.unloadRef = eventUtils.unloadAdd(function () {
    debug('unload');
    self.ws.close();
  });
  this.ws.onClose(function (e) {
    debug('close event', e.code, e.reason);
    self.emit('close', e.code, e.reason);

    self._cleanup();
  });
  this.ws.onError(function (e) {
    debug('error event', e);
    self.emit('close', 1006, 'WebSocket connection broken');

    self._cleanup();
  });
  return this;
}

inherits(TaroWebSocketTransport, EventEmitter);

TaroWebSocketTransport.prototype.send = function (data) {
  let msg = '[' + data + ']';
  debug('send', msg);
  this.ws.send({
    data: msg
  });
};

TaroWebSocketTransport.prototype.close = function () {
  debug('close');
  let ws = this.ws;

  this._cleanup();

  if (ws) {
    ws.close();
  }
};

TaroWebSocketTransport.prototype._cleanup = function () {
  debug('_cleanup');
  let ws = this.ws;

  if (ws) {
    ws.onmessage = ws.onclose = ws.onerror = null;
  }

  eventUtils.unloadDel(this.unloadRef);
  this.unloadRef = this.ws = null;
  this.removeAllListeners();
};

TaroWebSocketTransport.enabled = function () {
  debug('enabled');
  return !!WebsocketDriver;
};

TaroWebSocketTransport.transportName = 'taroWebsocket'; // In theory, ws should require 1 round trip. But in chrome, this is
// not very stable over SSL. Most likely a ws connection requires a
// separate SSL connection, in which case 2 round trips are an
// absolute minumum.

TaroWebSocketTransport.roundTrips = 2;

var transportList = [TaroWebSocketTransport];

/* eslint-disable */

/* jscs: disable */
// pulled specific shims from https://github.com/es-shims/es5-shim
let ArrayPrototype = Array.prototype;
let ObjectPrototype = Object.prototype;
let FunctionPrototype = Function.prototype;
let StringPrototype = String.prototype;
let array_slice = ArrayPrototype.slice;
let _toString = ObjectPrototype.toString;

let isFunction = function (val) {
  return ObjectPrototype.toString.call(val) === '[object Function]';
};

let isArray = function isArray(obj) {
  return _toString.call(obj) === '[object Array]';
};

let isString = function isString(obj) {
  return _toString.call(obj) === '[object String]';
};

let supportsDescriptors = Object.defineProperty && function () {
  try {
    Object.defineProperty({}, 'x', {});
    return true;
  } catch (e) {
    /* this is ES3 */
    return false;
  }
}(); // Define configurable, writable and non-enumerable props
// if they don't exist.


let defineProperty;

if (supportsDescriptors) {
  defineProperty = function (object, name, method, forceAssign) {
    if (!forceAssign && name in object) {
      return;
    }

    Object.defineProperty(object, name, {
      configurable: true,
      enumerable: false,
      writable: true,
      value: method
    });
  };
} else {
  defineProperty = function (object, name, method, forceAssign) {
    if (!forceAssign && name in object) {
      return;
    }

    object[name] = method;
  };
}

let defineProperties = function (object, map, forceAssign) {
  for (let name in map) {
    if (ObjectPrototype.hasOwnProperty.call(map, name)) {
      defineProperty(object, name, map[name], forceAssign);
    }
  }
};

let toObject = function (o) {
  if (o == null) {
    // this matches both null and undefined
    throw new TypeError("can't convert " + o + ' to object');
  }

  return Object(o);
}; //
// Util
// ======
//
// ES5 9.4
// http://es5.github.com/#x9.4
// http://jsperf.com/to-integer


function toInteger(num) {
  let n = +num;

  if (n !== n) {
    // isNaN
    n = 0;
  } else if (n !== 0 && n !== 1 / 0 && n !== -(1 / 0)) {
    n = (n > 0 || -1) * Math.floor(Math.abs(n));
  }

  return n;
}

function ToUint32(x) {
  return x >>> 0;
} //
// Function
// ========
//
// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5


function Empty() {}

defineProperties(FunctionPrototype, {
  bind: function bind(that) {
    // .length is 1
    // 1. Let Target be the this value.
    let target = this; // 2. If IsCallable(Target) is false, throw a TypeError exception.

    if (!isFunction(target)) {
      throw new TypeError('Function.prototype.bind called on incompatible ' + target);
    } // 3. Let A be a new (possibly empty) internal list of all of the
    //   argument values provided after thisArg (arg1, arg2 etc), in order.
    // XXX slicedArgs will stand in for "A" if used


    let args = array_slice.call(arguments, 1); // for normal call
    // 4. Let F be a new native ECMAScript object.
    // 11. Set the [[Prototype]] internal property of F to the standard
    //   built-in Function prototype object as specified in 15.3.3.1.
    // 12. Set the [[Call]] internal property of F as described in
    //   15.3.4.5.1.
    // 13. Set the [[Construct]] internal property of F as described in
    //   15.3.4.5.2.
    // 14. Set the [[HasInstance]] internal property of F as described in
    //   15.3.4.5.3.

    let binder = function () {
      if (this instanceof bound) {
        // 15.3.4.5.2 [[Construct]]
        // When the [[Construct]] internal method of a function object,
        // F that was created using the bind function is called with a
        // list of arguments ExtraArgs, the following steps are taken:
        // 1. Let target be the value of F's [[TargetFunction]]
        //   internal property.
        // 2. If target has no [[Construct]] internal method, a
        //   TypeError exception is thrown.
        // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
        //   property.
        // 4. Let args be a new list containing the same values as the
        //   list boundArgs in the same order followed by the same
        //   values as the list ExtraArgs in the same order.
        // 5. Return the result of calling the [[Construct]] internal
        //   method of target providing args as the arguments.
        let result = target.apply(this, args.concat(array_slice.call(arguments)));

        if (Object(result) === result) {
          return result;
        }

        return this;
      } else {
        // 15.3.4.5.1 [[Call]]
        // When the [[Call]] internal method of a function object, F,
        // which was created using the bind function is called with a
        // this value and a list of arguments ExtraArgs, the following
        // steps are taken:
        // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
        //   property.
        // 2. Let boundThis be the value of F's [[BoundThis]] internal
        //   property.
        // 3. Let target be the value of F's [[TargetFunction]] internal
        //   property.
        // 4. Let args be a new list containing the same values as the
        //   list boundArgs in the same order followed by the same
        //   values as the list ExtraArgs in the same order.
        // 5. Return the result of calling the [[Call]] internal method
        //   of target providing boundThis as the this value and
        //   providing args as the arguments.
        // equiv: target.call(this, ...boundArgs, ...args)
        return target.apply(that, args.concat(array_slice.call(arguments)));
      }
    }; // 15. If the [[Class]] internal property of Target is "Function", then
    //     a. Let L be the length property of Target minus the length of A.
    //     b. Set the length own property of F to either 0 or L, whichever is
    //       larger.
    // 16. Else set the length own property of F to 0.


    let boundLength = Math.max(0, target.length - args.length); // 17. Set the attributes of the length own property of F to the values
    //   specified in 15.3.5.1.

    let boundArgs = [];

    for (let i = 0; i < boundLength; i++) {
      boundArgs.push('$' + i);
    } // XXX Build a dynamic function with desired amount of arguments is the only
    // way to set the length property of a function.
    // In environments where Content Security Policies enabled (Chrome extensions,
    // for ex.) all use of eval or Function costructor throws an exception.
    // However in all of these environments Function.prototype.bind exists
    // and so this code will never be executed.


    let bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this, arguments); }')(binder);

    if (target.prototype) {
      Empty.prototype = target.prototype;
      bound.prototype = new Empty(); // Clean up dangling references.

      Empty.prototype = null;
    } // TODO
    // 18. Set the [[Extensible]] internal property of F to true.
    // TODO
    // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
    // 20. Call the [[DefineOwnProperty]] internal method of F with
    //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
    //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
    //   false.
    // 21. Call the [[DefineOwnProperty]] internal method of F with
    //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
    //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
    //   and false.
    // TODO
    // NOTE Function objects created using Function.prototype.bind do not
    // have a prototype property or the [[Code]], [[FormalParameters]], and
    // [[Scope]] internal properties.
    // XXX can't delete prototype in pure-js.
    // 22. Return F.


    return bound;
  }
}); //
// Array
// =====
//
// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray

defineProperties(Array, {
  isArray: isArray
});
let boxedString = Object('a');
let splitString = boxedString[0] !== 'a' || !(0 in boxedString);

let properlyBoxesContext = function properlyBoxed(method) {
  // Check node 0.6.21 bug where third parameter is not boxed
  let properlyBoxesNonStrict = true;
  let properlyBoxesStrict = true;

  if (method) {
    method.call('foo', function (_, __, context) {
      if (typeof context !== 'object') {
        properlyBoxesNonStrict = false;
      }
    });
    method.call([1], function () {
      properlyBoxesStrict = typeof this === 'string';
    }, 'x');
  }

  return !!method && properlyBoxesNonStrict && properlyBoxesStrict;
};

defineProperties(ArrayPrototype, {
  forEach: function forEach(fun
  /*, thisp*/
  ) {
    let object = toObject(this),
        self = splitString && isString(this) ? this.split('') : object,
        thisp = arguments[1],
        i = -1,
        length = self.length >>> 0; // If no callback function or if callback is not a callable function

    if (!isFunction(fun)) {
      throw new TypeError(); // TODO message
    }

    while (++i < length) {
      if (i in self) {
        // Invoke the callback function with call, passing arguments:
        // context, property value, property key, thisArg object
        // context
        fun.call(thisp, self[i], i, object);
      }
    }
  }
}, !properlyBoxesContext(ArrayPrototype.forEach)); // ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf

let hasFirefox2IndexOfBug = Array.prototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
defineProperties(ArrayPrototype, {
  indexOf: function indexOf(sought
  /*, fromIndex */
  ) {
    let self = splitString && isString(this) ? this.split('') : toObject(this),
        length = self.length >>> 0;

    if (!length) {
      return -1;
    }

    let i = 0;

    if (arguments.length > 1) {
      i = toInteger(arguments[1]);
    } // handle negative indices


    i = i >= 0 ? i : Math.max(0, length + i);

    for (; i < length; i++) {
      if (i in self && self[i] === sought) {
        return i;
      }
    }

    return -1;
  }
}, hasFirefox2IndexOfBug); //
// String
// ======
//
// ES5 15.5.4.14
// http://es5.github.com/#x15.5.4.14
// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
// Many browsers do not split properly with regular expressions or they
// do not perform the split correctly under obscure conditions.
// See http://blog.stevenlevithan.com/archives/cross-browser-split
// I've tested in many browsers and this seems to cover the deviant ones:
//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
//       [undefined, "t", undefined, "e", ...]
//    ''.split(/.?/) should be [], not [""]
//    '.'.split(/()()/) should be ["."], not ["", "", "."]

let string_split = StringPrototype.split;

if ('ab'.split(/(?:ab)*/).length !== 2 || '.'.split(/(.?)(.?)/).length !== 4 || 'tesst'.split(/(s)*/)[1] === 't' || 'test'.split(/(?:)/, -1).length !== 4 || ''.split(/.?/).length || '.'.split(/()()/).length > 1) {

  (function () {
    let compliantExecNpcg = /()??/.exec('')[1] === void 0; // NPCG: nonparticipating capturing group

    StringPrototype.split = function (separator, limit) {
      let string = this;

      if (separator === void 0 && limit === 0) {
        return [];
      } // If `separator` is not a regex, use native split


      if (_toString.call(separator) !== '[object RegExp]') {
        return string_split.call(this, separator, limit);
      }

      let output = [],
          flags = (separator.ignoreCase ? 'i' : '') + (separator.multiline ? 'm' : '') + (separator.extended ? 'x' : '') + ( // Proposed for ES6
      separator.sticky ? 'y' : ''),
          // Firefox 3+
      lastLastIndex = 0,
          // Make `global` and avoid `lastIndex` issues by working with a copy
      separator2,
          match,
          lastIndex,
          lastLength;
      separator = new RegExp(separator.source, flags + 'g');
      string += ''; // Type-convert

      if (!compliantExecNpcg) {
        // Doesn't need flags gy, but they don't hurt
        separator2 = new RegExp('^' + separator.source + '$(?!\\s)', flags);
      }
      /* Values for `limit`, per the spec:
       * If undefined: 4294967295 // Math.pow(2, 32) - 1
       * If 0, Infinity, or NaN: 0
       * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
       * If negative number: 4294967296 - Math.floor(Math.abs(limit))
       * If other: Type-convert, then use the above rules
       */


      limit = limit === void 0 ? -1 >>> 0 // Math.pow(2, 32) - 1
      : ToUint32(limit);

      while (match = separator.exec(string)) {
        // `separator.lastIndex` is not reliable cross-browser
        lastIndex = match.index + match[0].length;

        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index)); // Fix browsers whose `exec` methods don't consistently return `undefined` for
          // nonparticipating capturing groups

          if (!compliantExecNpcg && match.length > 1) {
            match[0].replace(separator2, function () {
              for (let i = 1; i < arguments.length - 2; i++) {
                if (arguments[i] === void 0) {
                  match[i] = void 0;
                }
              }
            });
          }

          if (match.length > 1 && match.index < string.length) {
            ArrayPrototype.push.apply(output, match.slice(1));
          }

          lastLength = match[0].length;
          lastLastIndex = lastIndex;

          if (output.length >= limit) {
            break;
          }
        }

        if (separator.lastIndex === match.index) {
          separator.lastIndex++; // Avoid an infinite loop
        }
      }

      if (lastLastIndex === string.length) {
        if (lastLength || !separator.test('')) {
          output.push('');
        }
      } else {
        output.push(string.slice(lastLastIndex));
      }

      return output.length > limit ? output.slice(0, limit) : output;
    };
  })(); // [bugfix, chrome]
  // If separator is undefined, then the result array contains just one String,
  // which is the this value (converted to a String). If limit is not undefined,
  // then the output array is truncated so that it contains no more than limit
  // elements.
  // "0".split(undefined, 0) -> []

} else if ('0'.split(void 0, 0).length) {
  StringPrototype.split = function split(separator, limit) {
    if (separator === void 0 && limit === 0) {
      return [];
    }

    return string_split.call(this, separator, limit);
  };
} // ECMA-262, 3rd B.2.3
// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
// non-normative section suggesting uniform semantics and it should be
// normalized across all browsers
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE


let string_substr = StringPrototype.substr;
let hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
defineProperties(StringPrototype, {
  substr: function substr(start, length) {
    return string_substr.call(this, start < 0 ? (start = this.length + start) < 0 ? 0 : start : start, length);
  }
}, hasNegativeSubstrBug);

var json3 = createCommonjsModule(function (module, exports) {
(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof undefined === "function" ;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes['object'] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes['object'] && module && !module.nodeType && typeof commonjsGlobal == "object" && commonjsGlobal;

  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root.Object());
    exports || (exports = root.Object());

    // Native constructor aliases.
    var Number = context.Number || root.Number,
        String = context.String || root.String,
        Object = context.Object || root.Object,
        Date = context.Date || root.Date,
        SyntaxError = context.SyntaxError || root.SyntaxError,
        TypeError = context.TypeError || root.TypeError,
        Math = context.Math || root.Math,
        nativeJSON = context.JSON || root.JSON;

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty = objectProto.hasOwnProperty,
        undefined$1;

    // Internal: Contains `try...catch` logic used by other functions.
    // This prevents other functions from being deoptimized.
    function attempt(func, errorFunc) {
      try {
        func();
      } catch (exception) {
        if (errorFunc) {
          errorFunc();
        }
      }
    }

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    attempt(function () {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    });

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] != null) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("date-serialization") && has("json-parse");
      } else if (name == "date-serialization") {
        // Indicates whether `Date`s can be serialized accurately by `JSON.stringify`.
        isSupported = has("json-stringify") && isExtended;
        if (isSupported) {
          var stringify = exports.stringify;
          attempt(function () {
            isSupported =
              // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
              // serialize extended years.
              stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
              // The milliseconds are optional in ES 5, but required in 5.1.
              stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
              // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
              // four-digit years instead of six-digit years. Credits: @Yaffle.
              stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
              // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
              // values less than 1000. Credits: @Yaffle.
              stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
          });
        }
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function";
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            attempt(function () {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undefined$1 &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undefined$1) === undefined$1 &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undefined$1 &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undefined$1]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undefined$1, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]";
            }, function () {
              stringifySupported = false;
            });
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse, parseSupported;
          if (typeof parse == "function") {
            attempt(function () {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  attempt(function () {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  });
                  if (parseSupported) {
                    attempt(function () {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    });
                  }
                  if (parseSupported) {
                    attempt(function () {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    });
                  }
                }
              }
            }, function () {
              parseSupported = false;
            });
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }
    has["bug-string-char-index"] = has["date-serialization"] = has["json"] = has["json-stringify"] = has["json-parse"] = null;

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      var forOwn = function (object, callback) {
        var size = 0, Properties, dontEnums, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        dontEnums = new Properties();
        for (property in dontEnums) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(dontEnums, property)) {
            size++;
          }
        }
        Properties = dontEnums = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          dontEnums = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forOwn = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = dontEnums.length; property = dontEnums[--length];) {
              if (hasProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forOwn = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forOwn(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify") && !has("date-serialization")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Serializes a date object.
        var serializeDate = function (value) {
          var getData, year, month, date, time, hours, minutes, seconds, milliseconds;
          // Define additional utility methods if the `Date` methods are buggy.
          if (!isExtended) {
            var floor = Math.floor;
            // A mapping between the months of the year and the number of days between
            // January 1st and the first of the respective month.
            var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
            // Internal: Calculates the number of days between the Unix epoch and the
            // first day of the given month.
            var getDay = function (year, month) {
              return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
            };
            getData = function (value) {
              // Manually compute the year, month, date, hours, minutes,
              // seconds, and milliseconds if the `getUTC*` methods are
              // buggy. Adapted from @Yaffle's `date-shim` project.
              date = floor(value / 864e5);
              for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
              for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
              date = 1 + date - getDay(year, month);
              // The `time` value specifies the time within the day (see ES
              // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
              // to compute `A modulo B`, as the `%` operator does not
              // correspond to the `modulo` operation for negative numbers.
              time = (value % 864e5 + 864e5) % 864e5;
              // The hours, minutes, seconds, and milliseconds are obtained by
              // decomposing the time within the day. See section 15.9.1.10.
              hours = floor(time / 36e5) % 24;
              minutes = floor(time / 6e4) % 60;
              seconds = floor(time / 1e3) % 60;
              milliseconds = time % 1e3;
            };
          } else {
            getData = function (value) {
              year = value.getUTCFullYear();
              month = value.getUTCMonth();
              date = value.getUTCDate();
              hours = value.getUTCHours();
              minutes = value.getUTCMinutes();
              seconds = value.getUTCSeconds();
              milliseconds = value.getUTCMilliseconds();
            };
          }
          serializeDate = function (value) {
            if (value > -1 / 0 && value < 1 / 0) {
              // Dates are serialized according to the `Date#toJSON` method
              // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
              // for the ISO 8601 date time string format.
              getData(value);
              // Serialize extended years correctly.
              value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
              "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
              // Months, dates, hours, minutes, and seconds should have two
              // digits; milliseconds should have three.
              "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
              // Milliseconds are optional in ES 5.0, but required in 5.1.
              "." + toPaddedString(3, milliseconds) + "Z";
              year = month = date = hours = minutes = seconds = milliseconds = null;
            } else {
              value = null;
            }
            return value;
          };
          return serializeDate(value);
        };

        // For environments with `JSON.stringify` but buggy date serialization,
        // we override the native `Date#toJSON` implementation with a
        // spec-compliant one.
        if (has("json-stringify") && !has("date-serialization")) {
          // Internal: the `Date#toJSON` implementation used to override the native one.
          function dateToJSON (key) {
            return serializeDate(this);
          }

          // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
          var nativeStringify = exports.stringify;
          exports.stringify = function (source, filter, width) {
            var nativeToJSON = Date.prototype.toJSON;
            Date.prototype.toJSON = dateToJSON;
            var result = nativeStringify(source, filter, width);
            Date.prototype.toJSON = nativeToJSON;
            return result;
          };
        } else {
          // Internal: Double-quotes a string `value`, replacing all ASCII control
          // characters (characters with code unit values between 0 and 31) with
          // their escaped equivalents. This is an implementation of the
          // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
          var unicodePrefix = "\\u00";
          var escapeChar = function (character) {
            var charCode = character.charCodeAt(0), escaped = Escapes[charCode];
            if (escaped) {
              return escaped;
            }
            return unicodePrefix + toPaddedString(2, charCode.toString(16));
          };
          var reEscape = /[\x00-\x1f\x22\x5c]/g;
          var quote = function (value) {
            reEscape.lastIndex = 0;
            return '"' +
              (
                reEscape.test(value)
                  ? value.replace(reEscape, escapeChar)
                  : value
              ) +
              '"';
          };

          // Internal: Recursively serializes an object. Implements the
          // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
          var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
            var value, type, className, results, element, index, length, prefix, result;
            attempt(function () {
              // Necessary for host object support.
              value = object[property];
            });
            if (typeof value == "object" && value) {
              if (value.getUTCFullYear && getClass.call(value) == dateClass && value.toJSON === Date.prototype.toJSON) {
                value = serializeDate(value);
              } else if (typeof value.toJSON == "function") {
                value = value.toJSON(property);
              }
            }
            if (callback) {
              // If a replacement function was provided, call it to obtain the value
              // for serialization.
              value = callback.call(object, property, value);
            }
            // Exit early if value is `undefined` or `null`.
            if (value == undefined$1) {
              return value === undefined$1 ? value : "null";
            }
            type = typeof value;
            // Only call `getClass` if the value is an object.
            if (type == "object") {
              className = getClass.call(value);
            }
            switch (className || type) {
              case "boolean":
              case booleanClass:
                // Booleans are represented literally.
                return "" + value;
              case "number":
              case numberClass:
                // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
                // `"null"`.
                return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
              case "string":
              case stringClass:
                // Strings are double-quoted and escaped.
                return quote("" + value);
            }
            // Recursively serialize objects and arrays.
            if (typeof value == "object") {
              // Check for cyclic structures. This is a linear search; performance
              // is inversely proportional to the number of unique nested objects.
              for (length = stack.length; length--;) {
                if (stack[length] === value) {
                  // Cyclic structures cannot be serialized by `JSON.stringify`.
                  throw TypeError();
                }
              }
              // Add the object to the stack of traversed objects.
              stack.push(value);
              results = [];
              // Save the current indentation level and indent one additional level.
              prefix = indentation;
              indentation += whitespace;
              if (className == arrayClass) {
                // Recursively serialize array elements.
                for (index = 0, length = value.length; index < length; index++) {
                  element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                  results.push(element === undefined$1 ? "null" : element);
                }
                result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
              } else {
                // Recursively serialize object members. Members are selected from
                // either a user-specified list of property names, or the object
                // itself.
                forOwn(properties || value, function (property) {
                  var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                  if (element !== undefined$1) {
                    // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                    // is not the empty string, let `member` {quote(property) + ":"}
                    // be the concatenation of `member` and the `space` character."
                    // The "`space` character" refers to the literal space
                    // character, not the `space` {width} argument provided to
                    // `JSON.stringify`.
                    results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                  }
                });
                result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
              }
              // Remove the object from the traversed object stack.
              stack.pop();
              return result;
            }
          };

          // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
          exports.stringify = function (source, filter, width) {
            var whitespace, callback, properties, className;
            if (objectTypes[typeof filter] && filter) {
              className = getClass.call(filter);
              if (className == functionClass) {
                callback = filter;
              } else if (className == arrayClass) {
                // Convert the property names array into a makeshift set.
                properties = {};
                for (var index = 0, length = filter.length, value; index < length;) {
                  value = filter[index++];
                  className = getClass.call(value);
                  if (className == "[object String]" || className == "[object Number]") {
                    properties[value] = 1;
                  }
                }
              }
            }
            if (width) {
              className = getClass.call(width);
              if (className == numberClass) {
                // Convert the `width` to an integer and create a string containing
                // `width` number of space characters.
                if ((width -= width % 1) > 0) {
                  if (width > 10) {
                    width = 10;
                  }
                  for (whitespace = ""; whitespace.length < width;) {
                    whitespace += " ";
                  }
                }
              } else if (className == stringClass) {
                whitespace = width.length <= 10 ? width : width.slice(0, 10);
              }
            }
            // Opera <= 7.54u2 discards the values associated with empty string keys
            // (`""`) only if they are used directly within an object member list
            // (e.g., `!("" in { "": 1})`).
            return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
          };
        }
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length; position++) {
                      charCode = source.charCodeAt(position);
                      if (charCode < 48 || charCode > 57) {
                        break;
                      }
                    }
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length; position++) {
                      charCode = source.charCodeAt(position);
                      if (charCode < 48 || charCode > 57) {
                        break;
                      }
                    }
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                var temp = source.slice(Index, Index + 4);
                if (temp == "true") {
                  Index += 4;
                  return true;
                } else if (temp == "fals" && source.charCodeAt(Index + 4 ) == 101) {
                  Index += 5;
                  return false;
                } else if (temp == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;;) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                } else {
                  hasMembers = true;
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;;) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                } else {
                  hasMembers = true;
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undefined$1) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forOwn` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(getClass, forOwn, value, length, callback);
              }
            } else {
              forOwn(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports.runInContext = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root.JSON3,
        isRestored = false;

    var JSON3 = runInContext(root, (root.JSON3 = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root.JSON3 = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }
}).call(commonjsGlobal);
});

// something else on the wire.
// eslint-disable-next-line no-control-regex, no-misleading-character-class

let extraEscapable = /[\x00-\x1f\ud800-\udfff\ufffe\uffff\u0300-\u0333\u033d-\u0346\u034a-\u034c\u0350-\u0352\u0357-\u0358\u035c-\u0362\u0374\u037e\u0387\u0591-\u05af\u05c4\u0610-\u0617\u0653-\u0654\u0657-\u065b\u065d-\u065e\u06df-\u06e2\u06eb-\u06ec\u0730\u0732-\u0733\u0735-\u0736\u073a\u073d\u073f-\u0741\u0743\u0745\u0747\u07eb-\u07f1\u0951\u0958-\u095f\u09dc-\u09dd\u09df\u0a33\u0a36\u0a59-\u0a5b\u0a5e\u0b5c-\u0b5d\u0e38-\u0e39\u0f43\u0f4d\u0f52\u0f57\u0f5c\u0f69\u0f72-\u0f76\u0f78\u0f80-\u0f83\u0f93\u0f9d\u0fa2\u0fa7\u0fac\u0fb9\u1939-\u193a\u1a17\u1b6b\u1cda-\u1cdb\u1dc0-\u1dcf\u1dfc\u1dfe\u1f71\u1f73\u1f75\u1f77\u1f79\u1f7b\u1f7d\u1fbb\u1fbe\u1fc9\u1fcb\u1fd3\u1fdb\u1fe3\u1feb\u1fee-\u1fef\u1ff9\u1ffb\u1ffd\u2000-\u2001\u20d0-\u20d1\u20d4-\u20d7\u20e7-\u20e9\u2126\u212a-\u212b\u2329-\u232a\u2adc\u302b-\u302c\uaab2-\uaab3\uf900-\ufa0d\ufa10\ufa12\ufa15-\ufa1e\ufa20\ufa22\ufa25-\ufa26\ufa2a-\ufa2d\ufa30-\ufa6d\ufa70-\ufad9\ufb1d\ufb1f\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufb4e\ufff0-\uffff]/g,
    extraLookup; // This may be quite slow, so let's delay until user actually uses bad
// characters.

let unrollLookup = function (escapable) {
  let i;
  let unrolled = {};
  let c = [];

  for (i = 0; i < 65536; i++) {
    c.push(String.fromCharCode(i));
  }

  escapable.lastIndex = 0;
  c.join('').replace(escapable, function (a) {
    unrolled[a] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    return '';
  });
  escapable.lastIndex = 0;
  return unrolled;
}; // Quote string, also taking care of unicode characters that browsers
// often break. Especially, take care of unicode surrogates:
// http://en.wikipedia.org/wiki/Mapping_of_Unicode_characters#Surrogates


var escape = {
  quote: function (string) {
    let quoted = json3.stringify(string); // In most cases this should be very fast and good enough.

    extraEscapable.lastIndex = 0;

    if (!extraEscapable.test(quoted)) {
      return quoted;
    }

    if (!extraLookup) {
      extraLookup = unrollLookup(extraEscapable);
    }

    return quoted.replace(extraEscapable, function (a) {
      return extraLookup[a];
    });
  }
};

function transport (availableTransports) {
  return {
    filterToEnabled: function (transportsWhitelist, info) {
      let transports = {
        main: [],
        facade: []
      };

      if (!transportsWhitelist) {
        transportsWhitelist = [];
      } else if (typeof transportsWhitelist === 'string') {
        transportsWhitelist = [transportsWhitelist];
      }

      availableTransports.forEach(function (trans) {
        if (!trans) {
          return;
        }

        if (trans.transportName === 'websocket' && info.websocket === false) {
          debug('disabled from server', 'websocket');
          return;
        }

        if (transportsWhitelist.length && transportsWhitelist.indexOf(trans.transportName) === -1) {
          debug('not in whitelist', trans.transportName);
          return;
        }

        if (trans.enabled(info)) {
          debug('enabled', trans.transportName);
          transports.main.push(trans);

          if (trans.facadeTransport) {
            transports.facade.push(trans.facadeTransport);
          }
        } else {
          debug('disabled', trans.transportName);
        }
      });
      return transports;
    }
  };
}

var objectUtils = {
  isObject: function (obj) {
    let type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  },
  extend: function (obj) {
    if (!this.isObject(obj)) {
      return obj;
    }

    let source, prop;

    for (let i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];

      for (prop in source) {
        if (Object.prototype.hasOwnProperty.call(source, prop)) {
          obj[prop] = source[prop];
        }
      }
    }

    return obj;
  }
};

var browser = {
  isOpera: function () {
    return global.navigator && /opera/i.test(global.navigator.userAgent);
  },
  isKonqueror: function () {
    return global.navigator && /konqueror/i.test(global.navigator.userAgent);
  },
  // #187 wrap document.domain in try/catch because of WP8 from file:///
  hasDomain: function () {
    // non-browser client always has a domain
    if (!global.document) {
      return true;
    }

    try {
      return !!global.document.domain;
    } catch (e) {
      return false;
    }
  }
};

let logObject = {};
['log', 'debug', 'warn'].forEach(function (level) {
  let levelExists;

  try {
    levelExists = global.console && global.console[level] && global.console[level].apply;
  } catch (e) {// do nothing
  }

  logObject[level] = levelExists ? function () {
    return global.console[level].apply(global.console, arguments);
  } : level === 'log' ? function () {} : logObject.log;
});

function Event(eventType) {
  this.type = eventType;
}

Event.prototype.initEvent = function (eventType, canBubble, cancelable) {
  this.type = eventType;
  this.bubbles = canBubble;
  this.cancelable = cancelable;
  this.timeStamp = +new Date();
  return this;
};

Event.prototype.stopPropagation = function () {};

Event.prototype.preventDefault = function () {};

Event.CAPTURING_PHASE = 1;
Event.AT_TARGET = 2;
Event.BUBBLING_PHASE = 3;

var loc = global.location || {
  origin: 'http://localhost:80',
  protocol: 'http:',
  host: 'localhost',
  port: 80,
  href: 'http://localhost/',
  hash: ''
};

function CloseEvent() {
  Event.call(this);
  this.initEvent('close', false, false);
  this.wasClean = false;
  this.code = 0;
  this.reason = '';
}

inherits(CloseEvent, Event);

function TransportMessageEvent(data) {
  Event.call(this);
  this.initEvent('message', false, false);
  this.data = data;
}

inherits(TransportMessageEvent, Event);

//   http://ajaxian.com/archives/100-line-ajax-wrapper
//   http://msdn.microsoft.com/en-us/library/cc288060(v=VS.85).aspx


function XDRObject(method, url, payload) {
  var self = this;
  EventEmitter.call(this);
  setTimeout(function () {
    self._start(method, url, payload);
  }, 0);
}

inherits(XDRObject, EventEmitter);

XDRObject.prototype._start = function (method, url, payload) {
  var self = this;
  var xdr = new global.XDomainRequest(); // IE caches even POSTs

  url = urlUtils.addQuery(url, 't=' + +new Date());

  xdr.onerror = function () {

    self._error();
  };

  xdr.ontimeout = function () {

    self._error();
  };

  xdr.onprogress = function () {
    self.emit('chunk', 200, xdr.responseText);
  };

  xdr.onload = function () {
    self.emit('finish', 200, xdr.responseText);

    self._cleanup(false);
  };

  this.xdr = xdr;
  this.unloadRef = eventUtils.unloadAdd(function () {
    self._cleanup(true);
  });

  try {
    // Fails with AccessDenied if port number is bogus
    this.xdr.open(method, url);

    if (this.timeout) {
      this.xdr.timeout = this.timeout;
    }

    this.xdr.send(payload);
  } catch (x) {
    this._error();
  }
};

XDRObject.prototype._error = function () {
  this.emit('finish', 0, '');

  this._cleanup(false);
};

XDRObject.prototype._cleanup = function (abort) {

  if (!this.xdr) {
    return;
  }

  this.removeAllListeners();
  eventUtils.unloadDel(this.unloadRef);
  this.xdr.ontimeout = this.xdr.onerror = this.xdr.onprogress = this.xdr.onload = null;

  if (abort) {
    try {
      this.xdr.abort();
    } catch (x) {// intentionally empty
    }
  }

  this.unloadRef = this.xdr = null;
};

XDRObject.prototype.close = function () {

  this._cleanup(true);
}; // IE 8/9 if the request target uses the same scheme - #79


XDRObject.enabled = !!(global.XDomainRequest && browser.hasDomain());

const http = require('http');

const https = require('https');

function XhrDriver(method, url, payload, opts) {
  debug(method, url, payload);
  let self = this;
  EventEmitter.call(this);
  let parsedUrl = new urlParse(url);
  let options = {
    method: method,
    hostname: parsedUrl.hostname.replace(/\[|\]/g, ''),
    port: parsedUrl.port,
    path: parsedUrl.pathname + (parsedUrl.query || ''),
    headers: opts && opts.headers,
    agent: false
  };
  let protocol = parsedUrl.protocol === 'https:' ? https : http;
  this.req = protocol.request(options, function (res) {
    res.setEncoding('utf8');
    let responseText = '';
    res.on('data', function (chunk) {
      debug('data', chunk);
      responseText += chunk;
      self.emit('chunk', 200, responseText);
    });
    res.once('end', function () {
      debug('end');
      self.emit('finish', res.statusCode, responseText);
      self.req = null;
    });
  });
  this.req.on('error', function (e) {
    debug('error', e);
    self.emit('finish', 0, e.message);
  });

  if (payload) {
    this.req.write(payload);
  }

  this.req.end();
}

inherits(XhrDriver, EventEmitter);

XhrDriver.prototype.close = function () {
  debug('close');
  this.removeAllListeners();

  if (this.req) {
    this.req.abort();
    this.req = null;
  }
};

XhrDriver.enabled = true;
XhrDriver.supportsCORS = true;

function XHRCorsObject(method, url, payload, opts) {
  XhrDriver.call(this, method, url, payload, opts);
}

inherits(XHRCorsObject, XhrDriver);
XHRCorsObject.enabled = XhrDriver.enabled && XhrDriver.supportsCORS;

function XHRLocalObject(method, url, payload
/*, opts */
) {
  XhrDriver.call(this, method, url, payload, {
    noCredentials: true
  });
}

inherits(XHRLocalObject, XhrDriver);
XHRLocalObject.enabled = XhrDriver.enabled;

function XHRFake()
/* method, url, payload, opts */
{
  let self = this;
  EventEmitter.call(this);
  this.to = setTimeout(function () {
    self.emit('finish', 200, '{}');
  }, XHRFake.timeout);
}

inherits(XHRFake, EventEmitter);

XHRFake.prototype.close = function () {
  clearTimeout(this.to);
};

XHRFake.timeout = 2000;

function InfoAjax(url, AjaxObject) {
  EventEmitter.call(this);
  let self = this;
  let t0 = +new Date();
  this.xo = new AjaxObject('GET', url);
  this.xo.once('finish', function (status, text) {
    let info, rtt;

    if (status === 200) {
      rtt = +new Date() - t0;

      if (text) {
        try {
          info = json3.parse(text);
        } catch (e) {
          debug('bad json', text);
        }
      }

      if (!objectUtils.isObject(info)) {
        info = {};
      }
    }

    self.emit('finish', info, rtt);
    self.removeAllListeners();
  });
}

inherits(InfoAjax, EventEmitter);

InfoAjax.prototype.close = function () {
  this.removeAllListeners();
  this.xo.close();
};

function InfoReceiver(baseUrl, urlInfo) {
  debug(baseUrl);
  let self = this;
  EventEmitter.call(this);
  setTimeout(function () {
    self.doXhr(baseUrl, urlInfo);
  }, 0);
}

inherits(InfoReceiver, EventEmitter); // TODO this is currently ignoring the list of available transports and the whitelist

InfoReceiver._getReceiver = function (baseUrl, url, urlInfo) {
  // determine method of CORS support (if needed)
  if (urlInfo.sameOrigin) {
    return new InfoAjax(url, XHRLocalObject);
  }

  if (XHRCorsObject.enabled) {
    return new InfoAjax(url, XHRCorsObject);
  }

  if (XDRObject.enabled && urlInfo.sameScheme) {
    return new InfoAjax(url, XDRObject);
  }

  return new InfoAjax(url, XHRFake);
};

InfoReceiver.prototype.doXhr = function (baseUrl, urlInfo) {
  let self = this,
      url = urlUtils.addPath(baseUrl, '/info');
  debug('doXhr', url);
  this.xo = InfoReceiver._getReceiver(baseUrl, url, urlInfo);
  this.timeoutRef = setTimeout(function () {
    debug('timeout');

    self._cleanup(false);

    self.emit('finish');
  }, InfoReceiver.timeout);
  this.xo.once('finish', function (info, rtt) {
    debug('finish', info, rtt);

    self._cleanup(true);

    self.emit('finish', info, rtt);
  });
};

InfoReceiver.prototype._cleanup = function (wasClean) {
  debug('_cleanup');
  clearTimeout(this.timeoutRef);
  this.timeoutRef = null;

  if (!wasClean && this.xo) {
    this.xo.close();
  }

  this.xo = null;
};

InfoReceiver.prototype.close = function () {
  debug('close');
  this.removeAllListeners();

  this._cleanup(false);
};

InfoReceiver.timeout = 8000;

var version = "1.0.3";

var iframeUtils = {
  WPrefix: '_jp',
  currentWindowId: null,
  iframeEnabled: false,
  polluteGlobalNamespace: function () {
    if (!(module.exports.WPrefix in global)) {
      global[module.exports.WPrefix] = {};
    }
  },
  postMessage: function (type, data) {
    if (global.parent !== global) {
      global.parent.postMessage(json3.stringify({
        windowId: module.exports.currentWindowId,
        type: type,
        data: data || ''
      }), '*');
    } else {
      debug('Cannot postMessage, no parent window.', type, data);
    }
  },
  createIframe: function (iframeUrl, errorCallback) {
    let iframe = global.document.createElement('iframe');
    let tref, unloadRef;

    let unattach = function () {
      debug('unattach');
      clearTimeout(tref); // Explorer had problems with that.

      try {
        iframe.onload = null;
      } catch (x) {// intentionally empty
      }

      iframe.onerror = null;
    };

    let cleanup = function () {
      debug('cleanup');

      if (iframe) {
        unattach(); // This timeout makes chrome fire onbeforeunload event
        // within iframe. Without the timeout it goes straight to
        // onunload.

        setTimeout(function () {
          if (iframe) {
            iframe.parentNode.removeChild(iframe);
          }

          iframe = null;
        }, 0);
        eventUtils.unloadDel(unloadRef);
      }
    };

    let onerror = function (err) {
      debug('onerror', err);

      if (iframe) {
        cleanup();
        errorCallback(err);
      }
    };

    let post = function (msg, origin) {
      debug('post', msg, origin);
      setTimeout(function () {
        try {
          // When the iframe is not loaded, IE raises an exception
          // on 'contentWindow'.
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(msg, origin);
          }
        } catch (x) {// intentionally empty
        }
      }, 0);
    };

    iframe.src = iframeUrl;
    iframe.style.display = 'none';
    iframe.style.position = 'absolute';

    iframe.onerror = function () {
      onerror('onerror');
    };

    iframe.onload = function () {
      debug('onload'); // `onload` is triggered before scripts on the iframe are
      // executed. Give it few seconds to actually load stuff.

      clearTimeout(tref);
      tref = setTimeout(function () {
        onerror('onload timeout');
      }, 2000);
    };

    global.document.body.appendChild(iframe);
    tref = setTimeout(function () {
      onerror('timeout');
    }, 15000);
    unloadRef = eventUtils.unloadAdd(cleanup);
    return {
      post: post,
      cleanup: cleanup,
      loaded: unattach
    };
  },

  /* eslint no-undef: "off", new-cap: "off" */
  createHtmlfile: function (iframeUrl, errorCallback) {
    let axo = ['Active'].concat('Object').join('X');
    let doc = new global[axo]('htmlfile');
    let tref, unloadRef;
    let iframe;

    let unattach = function () {
      clearTimeout(tref);
      iframe.onerror = null;
    };

    let cleanup = function () {
      if (doc) {
        unattach();
        eventUtils.unloadDel(unloadRef);
        iframe.parentNode.removeChild(iframe);
        iframe = doc = null;
        CollectGarbage();
      }
    };

    let onerror = function (r) {
      debug('onerror', r);

      if (doc) {
        cleanup();
        errorCallback(r);
      }
    };

    let post = function (msg, origin) {
      try {
        // When the iframe is not loaded, IE raises an exception
        // on 'contentWindow'.
        setTimeout(function () {
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(msg, origin);
          }
        }, 0);
      } catch (x) {// intentionally empty
      }
    };

    doc.open();
    doc.write('<html><s' + 'cript>' + 'document.domain="' + global.document.domain + '";' + '</s' + 'cript></html>');
    doc.close();
    doc.parentWindow[module.exports.WPrefix] = global[module.exports.WPrefix];
    let c = doc.createElement('div');
    doc.body.appendChild(c);
    iframe = doc.createElement('iframe');
    c.appendChild(iframe);
    iframe.src = iframeUrl;

    iframe.onerror = function () {
      onerror('onerror');
    };

    tref = setTimeout(function () {
      onerror('timeout');
    }, 15000);
    unloadRef = eventUtils.unloadAdd(cleanup);
    return {
      post: post,
      cleanup: cleanup,
      loaded: unattach
    };
  }
};

function FacadeJS(transport) {
  this._transport = transport;
  transport.on('message', this._transportMessage.bind(this));
  transport.on('close', this._transportClose.bind(this));
}

FacadeJS.prototype._transportClose = function (code, reason) {
  iframeUtils.postMessage('c', json3.stringify([code, reason]));
};

FacadeJS.prototype._transportMessage = function (frame) {
  iframeUtils.postMessage('t', frame);
};

FacadeJS.prototype._send = function (data) {
  this._transport.send(data);
};

FacadeJS.prototype._close = function () {
  this._transport.close();

  this._transport.removeAllListeners();
};

function InfoReceiverIframe(transUrl) {
  let self = this;
  EventEmitter.call(this);
  this.ir = new InfoAjax(transUrl, XHRLocalObject);
  this.ir.once('finish', function (info, rtt) {
    self.ir = null;
    self.emit('message', json3.stringify([info, rtt]));
  });
}

inherits(InfoReceiverIframe, EventEmitter);
InfoReceiverIframe.transportName = 'iframe-info-receiver';

InfoReceiverIframe.prototype.close = function () {
  if (this.ir) {
    this.ir.close();
    this.ir = null;
  }

  this.removeAllListeners();
};

function iframeBootstrap (SockJS, availableTransports) {
  let transportMap = {};
  availableTransports.forEach(function (at) {
    if (at.facadeTransport) {
      transportMap[at.facadeTransport.transportName] = at.facadeTransport;
    }
  }); // hard-coded for the info iframe
  // TODO see if we can make this more dynamic

  transportMap[InfoReceiverIframe.transportName] = InfoReceiverIframe;
  let parentOrigin;
  /* eslint-disable camelcase */

  SockJS.bootstrap_iframe = function () {
    /* eslint-enable camelcase */
    let facade;
    iframeUtils.currentWindowId = loc.hash.slice(1);

    let onMessage = function (e) {
      if (e.source !== parent) {
        return;
      }

      if (typeof parentOrigin === 'undefined') {
        parentOrigin = e.origin;
      }

      if (e.origin !== parentOrigin) {
        return;
      }

      let iframeMessage;

      try {
        iframeMessage = json3.parse(e.data);
      } catch (ignored) {
        debug('bad json', e.data);
        return;
      }

      if (iframeMessage.windowId !== iframeUtils.currentWindowId) {
        return;
      }

      switch (iframeMessage.type) {
        case 's':
          let p;

          try {
            p = json3.parse(iframeMessage.data);
          } catch (ignored) {
            debug('bad json', iframeMessage.data);
            break;
          }

          let version = p[0];
          let transport = p[1];
          let transUrl = p[2];
          let baseUrl = p[3];
          debug(version, transport, transUrl, baseUrl); // change this to semver logic

          if (version !== SockJS.version) {
            throw new Error('Incompatible SockJS! Main site uses:' + ' "' + version + '", the iframe:' + ' "' + SockJS.version + '".');
          }

          if (!urlUtils.isOriginEqual(transUrl, loc.href) || !urlUtils.isOriginEqual(baseUrl, loc.href)) {
            throw new Error("Can't connect to different domain from within an " + 'iframe. (' + loc.href + ', ' + transUrl + ', ' + baseUrl + ')');
          }

          facade = new FacadeJS(new transportMap[transport](transUrl, baseUrl));
          break;

        case 'm':
          facade._send(iframeMessage.data);

          break;

        case 'c':
          if (facade) {
            facade._close();
          }

          facade = null;
          break;
      }
    };

    eventUtils.attachEvent('message', onMessage); // Start

    iframeUtils.postMessage('s');
  };
}

let transports; // follow constructor steps defined at http://dev.w3.org/html5/websockets/#the-websocket-interface

function SockJS(url, protocols, options) {
  if (!(this instanceof SockJS)) {
    return new SockJS(url, protocols, options);
  }

  if (arguments.length < 1) {
    throw new TypeError("Failed to construct 'SockJS: 1 argument from , but only 0 present");
  }

  EventTarget.call(this);
  this.readyState = SockJS.CONNECTING;
  this.extensions = '';
  this.protocol = ''; // non-standard extension

  options = options || {};

  if (options.protocols_whitelist) {
    logObject.warn("'protocols_whitelist' is DEPRECATED. Use 'transports' instead.");
  }

  this._transportsWhitelist = options.transports;
  this._transportOptions = options.transportOptions || {};
  this._timeout = options.timeout || 0;
  let sessionId = options.sessionId || 8;

  if (typeof sessionId === 'function') {
    this._generateSessionId = sessionId;
  } else if (typeof sessionId === 'number') {
    this._generateSessionId = function () {
      return random.string(sessionId);
    };
  } else {
    throw new TypeError('If sessionId is used in the options, it needs to be a number or a function.');
  }

  this._server = options.server || random.numberString(1000); // Step 1 of WS spec - parse and validate the url. Issue #8

  let parsedUrl = new urlParse(url);

  if (!parsedUrl.host || !parsedUrl.protocol) {
    throw new SyntaxError("The URL '" + url + "' is invalid");
  } else if (parsedUrl.hash) {
    throw new SyntaxError('The URL must not contain a fragment');
  } else if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new SyntaxError("The URL's scheme must be either 'http:' or 'https:'. '" + parsedUrl.protocol + "' is not allowed.");
  }

  let secure = parsedUrl.protocol === 'https:'; // Step 2 - don't allow secure origin with an insecure protocol

  if (loc.protocol === 'https:' && !secure) {
    // exception is 127.0.0.0/8 and ::1 urls
    if (!urlUtils.isLoopbackAddr(parsedUrl.hostname)) {
      throw new Error('SecurityError: An insecure SockJS connection may not be initiated from a page loaded over HTTPS');
    }
  } // Step 3 - check port access - no need here
  // Step 4 - parse protocols argument


  if (!protocols) {
    protocols = [];
  } else if (!Array.isArray(protocols)) {
    protocols = [protocols];
  } // Step 5 - check protocols argument


  let sortedProtocols = protocols.sort();
  sortedProtocols.forEach(function (proto, i) {
    if (!proto) {
      throw new SyntaxError("The protocols entry '" + proto + "' is invalid.");
    }

    if (i < sortedProtocols.length - 1 && proto === sortedProtocols[i + 1]) {
      throw new SyntaxError("The protocols entry '" + proto + "' is duplicated.");
    }
  }); // Step 6 - convert origin

  let o = urlUtils.getOrigin(loc.href);
  this._origin = o ? o.toLowerCase() : null; // remove the trailing slash

  parsedUrl.set('pathname', parsedUrl.pathname.replace(/\/+$/, '')); // store the sanitized url

  this.url = parsedUrl.href;
  debug('using url', this.url); // Step 7 - start connection in background
  // obtain server info
  // http://sockjs.github.io/sockjs-protocol/sockjs-protocol-0.3.3.html#section-26

  this._urlInfo = {
    nullOrigin: !browser.hasDomain(),
    sameOrigin: urlUtils.isOriginEqual(this.url, loc.href),
    sameScheme: urlUtils.isSchemeEqual(this.url, loc.href)
  };
  this._ir = new InfoReceiver(this.url, this._urlInfo);

  this._ir.once('finish', this._receiveInfo.bind(this));
}

inherits(SockJS, EventTarget);

function userSetCode(code) {
  return code === 1000 || code >= 3000 && code <= 4999;
}

SockJS.prototype.close = function (code, reason) {
  // Step 1
  if (code && !userSetCode(code)) {
    throw new Error('InvalidAccessError: Invalid code');
  } // Step 2.4 states the max is 123 bytes, but we are just checking length


  if (reason && reason.length > 123) {
    throw new SyntaxError('reason argument has an invalid length');
  } // Step 3.1


  if (this.readyState === SockJS.CLOSING || this.readyState === SockJS.CLOSED) {
    return;
  } // TODO look at docs to determine how to set this


  let wasClean = true;

  this._close(code || 1000, reason || 'Normal closure', wasClean);
};

SockJS.prototype.send = function (data) {
  // #13 - convert anything non-string to string
  // TODO this currently turns objects into [object Object]
  if (typeof data !== 'string') {
    data = '' + data;
  }

  if (this.readyState === SockJS.CONNECTING) {
    throw new Error('InvalidStateError: The connection has not been established yet');
  }

  if (this.readyState !== SockJS.OPEN) {
    return;
  }

  this._transport.send(escape.quote(data));
};

SockJS.version = version;
SockJS.CONNECTING = 0;
SockJS.OPEN = 1;
SockJS.CLOSING = 2;
SockJS.CLOSED = 3;

SockJS.prototype._receiveInfo = function (info, rtt) {
  debug('_receiveInfo', rtt);
  this._ir = null;

  if (!info) {
    this._close(1002, 'Cannot connect to server');

    return;
  } // establish a round-trip timeout (RTO) based on the
  // round-trip time (RTT)


  this._rto = this.countRTO(rtt); // allow server to override url used for the actual transport

  this._transUrl = info.base_url ? info.base_url : this.url;
  info = objectUtils.extend(info, this._urlInfo);
  debug('info', info); // determine list of desired and supported transports

  let enabledTransports = transports.filterToEnabled(this._transportsWhitelist, info);
  this._transports = enabledTransports.main;
  debug(this._transports.length + ' enabled transports');

  this._connect();
};

SockJS.prototype._connect = async function () {
  for (let Transport = this._transports.shift(); Transport; Transport = this._transports.shift()) {
    debug('attempt', Transport.transportName);

    if (Transport.needBody) {
      if (!global.document.body || typeof global.document.readyState !== 'undefined' && global.document.readyState !== 'complete' && global.document.readyState !== 'interactive') {
        debug('waiting for body');

        this._transports.unshift(Transport);

        eventUtils.attachEvent('load', this._connect.bind(this));
        return;
      }
    } // calculate timeout based on RTO and round trips. Default to 5s


    let timeoutMs = Math.max(this._timeout, this._rto * Transport.roundTrips || 5000); // this._transportTimeoutId = setTimeout(
    //   this._transportTimeout.bind(this),
    //   timeoutMs,
    // )
    // debug('using timeout', timeoutMs)

    let transportUrl = urlUtils.addPath(this._transUrl, '/' + this._server + '/' + this._generateSessionId());
    let options = this._transportOptions[Transport.transportName];
    debug('transport url', transportUrl);
    let transportObj = new Transport(transportUrl, this._transUrl, options);

    if (transportObj.then) {
      transportObj.then(transportObj => {
        transportObj.on('message', this._transportMessage.bind(this));
        transportObj.once('close', this._transportClose.bind(this));
        this._transport = transportObj;
      });
    } else {
      transportObj.on('message', this._transportMessage.bind(this));
      transportObj.once('close', this._transportClose.bind(this));
      this._transport = transportObj;
    }

    transportObj.transportName = Transport.transportName;
    return;
  }

  this._close(2000, 'All transports failed', false);
};

SockJS.prototype._transportTimeout = function () {
  debug('_transportTimeout');

  if (this.readyState === SockJS.CONNECTING) {
    if (this._transport) {
      this._transport.close();
    }

    this._transportClose(2007, 'Transport timed out');
  }
};

SockJS.prototype._transportMessage = function (msg) {
  debug('_transportMessage', msg);
  let self = this,
      type = msg.slice(0, 1),
      content = msg.slice(1),
      payload; // first check for messages that don't need a payload

  switch (type) {
    case 'o':
      this._open();

      return;

    case 'h':
      this.dispatchEvent(new Event('heartbeat'));
      debug('heartbeat', this.transport);
      return;
  }

  if (content) {
    try {
      payload = json3.parse(content);
    } catch (e) {
      debug('bad json', content);
    }
  }

  if (typeof payload === 'undefined') {
    debug('empty payload', content);
    return;
  }

  switch (type) {
    case 'a':
      if (Array.isArray(payload)) {
        payload.forEach(function (p) {
          debug('message', self.transport, p);
          self.dispatchEvent(new TransportMessageEvent(p));
        });
      }

      break;

    case 'm':
      debug('message', this.transport, payload);
      this.dispatchEvent(new TransportMessageEvent(payload));
      break;

    case 'c':
      if (Array.isArray(payload) && payload.length === 2) {
        this._close(payload[0], payload[1], true);
      }

      break;
  }
};

SockJS.prototype._transportClose = function (code, reason) {
  debug('_transportClose', this.transport, code, reason);

  if (this._transport) {
    this._transport.removeAllListeners();

    this._transport = null;
    this.transport = null;
  }

  if (!userSetCode(code) && code !== 2000 && this.readyState === SockJS.CONNECTING) {
    this._connect();

    return;
  }

  this._close(code, reason);
};

SockJS.prototype._open = function () {
  debug('_open', this._transport && this._transport.transportName, this.readyState);

  if (this.readyState === SockJS.CONNECTING) {
    if (this._transportTimeoutId) {
      clearTimeout(this._transportTimeoutId);
      this._transportTimeoutId = null;
    }

    this.readyState = SockJS.OPEN;
    this.transport = this._transport.transportName;
    this.dispatchEvent(new Event('open'));
    debug('connected', this.transport);
  } else {
    // The server might have been restarted, and lost track of our
    // connection.
    this._close(1006, 'Server lost session');
  }
};

SockJS.prototype._close = function (code, reason, wasClean) {
  debug('_close', this.transport, code, reason, wasClean, this.readyState);
  let forceFail = false;

  if (this._ir) {
    forceFail = true;

    this._ir.close();

    this._ir = null;
  }

  if (this._transport) {
    this._transport.close();

    this._transport = null;
    this.transport = null;
  }

  if (this.readyState === SockJS.CLOSED) {
    throw new Error('InvalidStateError: SockJS has already been closed');
  }

  this.readyState = SockJS.CLOSING;
  setTimeout(function () {
    this.readyState = SockJS.CLOSED;

    if (forceFail) {
      this.dispatchEvent(new Event('error'));
    }

    let e = new CloseEvent('close');
    e.wasClean = wasClean || false;
    e.code = code || 1000;
    e.reason = reason;
    this.dispatchEvent(e);
    this.onmessage = this.onclose = this.onerror = null;
    debug('disconnected');
  }.bind(this), 0);
}; // See: http://www.erg.abdn.ac.uk/~gerrit/dccp/notes/ccid2/rto_estimator/
// and RFC 2988.


SockJS.prototype.countRTO = function (rtt) {
  // In a local environment, when using IE8/9 and the `jsonp-polling`
  // transport the time needed to establish a connection (the time that pass
  // from the opening of the transport to the call of `_dispatchOpen`) is
  // around 200msec (the lower bound used in the article above) and this
  // causes spurious timeouts. For this reason we calculate a value slightly
  // larger than that used in the article.
  if (rtt > 100) {
    return 4 * rtt; // rto > 400msec
  }

  return 300 + rtt; // 300msec < rto <= 400msec
};

function wrapSockJs(availableTransports) {
  transports = transport(availableTransports);
  iframeBootstrap(SockJS, availableTransports);
  return SockJS;
}

var index = wrapSockJs(transportList);

export default index;
