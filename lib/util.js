'use strict';

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _getIterator2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/get-iterator"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/is-array"));

var _iterator6 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/symbol/iterator"));

var _symbol = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/symbol"));

var _from = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/from"));

var _extends2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/extends"));

var _has = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/reflect/has"));

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));

var _request2 = _interopRequireDefault(require("request"));

var _pinkie = _interopRequireDefault(require("pinkie"));

var _pify = _interopRequireDefault(require("pify"));

var _desiredCapabilities = _interopRequireDefault(require("desired-capabilities"));

var _nodeTunnel = _interopRequireDefault(require("@lambdatest/node-tunnel"));

var _fs = _interopRequireDefault(require("fs"));

function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it; if (typeof _symbol["default"] === "undefined" || o[_iterator6["default"]] == null) { if ((0, _isArray["default"])(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } it = (0, _getIterator2["default"])(o); return it.next.bind(it); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return (0, _from["default"])(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var promisify = function promisify(fn) {
  return (0, _pify["default"])(fn, _pinkie["default"]);
};

var request = promisify(_request2["default"], _pinkie["default"]);
var PROCESS_ENVIRONMENT = process.env;
var BASE_URL = 'https://api.lambdatest.com/api/v1';
var AUTOMATION_BASE_URL = 'https://api.lambdatest.com/automation/api/v1';
var AUTOMATION_DASHBOARD_URL = 'https://automation.lambdatest.com';
var AUTOMATION_HUB_URL = process.env.LT_GRID_URL || 'hub.lambdatest.com';
var LT_AUTH_ERROR = 'Authentication failed. Please assign the correct username and access key to the LT_USERNAME and LT_ACCESS_KEY environment variables.';
var connectorInstance = null;
var tunnelArguments = {};
var capabilities = {};
var retryCounter = 60;
var isRunning = false;
var isTraceEnable = false;
if (PROCESS_ENVIRONMENT.LT_ENABLE_TRACE) isTraceEnable = true;

function requestApi(_x) {
  return _requestApi.apply(this, arguments);
}

function _requestApi() {
  _requestApi = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(options) {
    var response;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return request(options);

          case 2:
            response = _context.sent;
            _context.prev = 3;
            return _context.abrupt("return", IsJsonString(response.body));

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](3);
            showTrace('API Response', response.body);
            showTrace('Error while API call ', _context.t0);
            return _context.abrupt("return", null);

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 7]]);
  }));
  return _requestApi.apply(this, arguments);
}

function IsJsonString(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return false;
  }
}

function _getBrowserList() {
  return _getBrowserList2.apply(this, arguments);
}

function _getBrowserList2() {
  _getBrowserList2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    var browserList, osList, _iterator, _step, os, _browserList, _iterator4, _step4, browser, _iterator5, _step5, version, deviceList, key, element, _iterator2, _step2, device, _iterator3, _step3, osVersion;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            browserList = [];
            _context2.next = 3;
            return requestApi(BASE_URL + "/capability?format=array");

          case 3:
            osList = _context2.sent;
            _iterator = _createForOfIteratorHelperLoose(osList.os);

          case 5:
            if ((_step = _iterator()).done) {
              _context2.next = 13;
              break;
            }

            os = _step.value;
            _context2.next = 9;
            return requestApi(BASE_URL + "/capability?os=" + os.id + "&format=array");

          case 9:
            _browserList = _context2.sent;

            for (_iterator4 = _createForOfIteratorHelperLoose(_browserList); !(_step4 = _iterator4()).done;) {
              browser = _step4.value;

              for (_iterator5 = _createForOfIteratorHelperLoose(browser.versions); !(_step5 = _iterator5()).done;) {
                version = _step5.value;
                browserList.push(browser.name + "@" + version.version + ":" + os.name);
              }
            }

          case 11:
            _context2.next = 5;
            break;

          case 13:
            _context2.next = 15;
            return requestApi(BASE_URL + "/device");

          case 15:
            deviceList = _context2.sent;

            for (key in deviceList) {
              if ((0, _has["default"])(deviceList, key)) {
                element = deviceList[key];

                for (_iterator2 = _createForOfIteratorHelperLoose(element); !(_step2 = _iterator2()).done;) {
                  device = _step2.value;

                  for (_iterator3 = _createForOfIteratorHelperLoose(device.osVersion); !(_step3 = _iterator3()).done;) {
                    osVersion = _step3.value;
                    browserList.push(device.deviceName + "@" + osVersion.version + ":" + key);
                  }
                }
              }
            }

            return _context2.abrupt("return", browserList);

          case 18:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _getBrowserList2.apply(this, arguments);
}

function _connect() {
  return _connect2.apply(this, arguments);
}

function _connect2() {
  _connect2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
    var logFile, v;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;

            if (PROCESS_ENVIRONMENT.LT_TUNNEL_NAME) {
              _context3.next = 18;
              break;
            }

            if (connectorInstance) {
              _context3.next = 16;
              break;
            }

            connectorInstance = new _nodeTunnel["default"]();
            logFile = PROCESS_ENVIRONMENT.LT_LOGFILE || 'lambdaTunnelLog.log';
            v = PROCESS_ENVIRONMENT.LT_VERBOSE;
            tunnelArguments = {
              user: PROCESS_ENVIRONMENT.LT_USERNAME,
              key: PROCESS_ENVIRONMENT.LT_ACCESS_KEY,
              logFile: logFile,
              controller: 'testcafe'
            };
            if (v === 'true' || v === true) tunnelArguments.v = true;
            if (PROCESS_ENVIRONMENT.LT_PROXY_HOST) tunnelArguments.proxyHost = PROCESS_ENVIRONMENT.LT_PROXY_HOST;
            if (PROCESS_ENVIRONMENT.LT_PROXY_PORT) tunnelArguments.proxyPort = PROCESS_ENVIRONMENT.LT_PROXY_PORT;
            if (PROCESS_ENVIRONMENT.LT_PROXY_USER) tunnelArguments.proxyUser = PROCESS_ENVIRONMENT.LT_PROXY_USER;
            if (PROCESS_ENVIRONMENT.LT_PROXY_PASS) tunnelArguments.proxyPass = PROCESS_ENVIRONMENT.LT_PROXY_PASS;
            tunnelArguments.tunnelName = PROCESS_ENVIRONMENT.LT_TUNNEL_NAME || "TestCafe-" + new Date().getTime();
            if (PROCESS_ENVIRONMENT.LT_DIR) tunnelArguments.dir = PROCESS_ENVIRONMENT.LT_DIR;
            _context3.next = 16;
            return connectorInstance.start(tunnelArguments);

          case 16:
            _context3.next = 18;
            return _waitForTunnelRunning();

          case 18:
            _context3.next = 23;
            break;

          case 20:
            _context3.prev = 20;
            _context3.t0 = _context3["catch"](0);
            showTrace('_connect error :', _context3.t0);

          case 23:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 20]]);
  }));
  return _connect2.apply(this, arguments);
}

function _destroy() {
  return _destroy2.apply(this, arguments);
}

function _destroy2() {
  _destroy2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
    var tunnelName;
    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;

            if (!connectorInstance) {
              _context4.next = 9;
              break;
            }

            _context4.next = 4;
            return connectorInstance.getTunnelName();

          case 4:
            tunnelName = _context4.sent;
            showTrace('Stopping Tunnel :', tunnelName);
            _context4.next = 8;
            return connectorInstance.stop();

          case 8:
            connectorInstance = null;

          case 9:
            _context4.next = 14;
            break;

          case 11:
            _context4.prev = 11;
            _context4.t0 = _context4["catch"](0);
            showTrace('util._destroy error :', _context4.t0);

          case 14:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[0, 11]]);
  }));
  return _destroy2.apply(this, arguments);
}

function _parseCapabilities(_x2, _x3) {
  return _parseCapabilities2.apply(this, arguments);
}

function _parseCapabilities2() {
  _parseCapabilities2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(id, capability) {
    var testcafeDetail, parseCapabilitiesData, browserName, browserVersion, platform, lPlatform, additionalCapabilities, _isRunning;

    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            testcafeDetail = require('../package.json');
            parseCapabilitiesData = (0, _desiredCapabilities["default"])(capability)[0];
            browserName = parseCapabilitiesData.browserName;
            browserVersion = parseCapabilitiesData.browserVersion;
            platform = parseCapabilitiesData.platform;
            lPlatform = platform.toLowerCase();
            capabilities[id] = {
              tunnel: true,
              plugin: testcafeDetail.name + ":" + testcafeDetail.version
            };

            if (['ios', 'android'].includes(lPlatform)) {
              //capabilities[id].platformName = lPlatform;
              capabilities[id].deviceName = browserName; //capabilities[id].platformVersion = browserVersion;
            } else {
              capabilities[id].browserName = browserName;
              capabilities[id].version = browserVersion.toLowerCase();
              capabilities[id].platform = lPlatform;
            }

            if (!PROCESS_ENVIRONMENT.LT_CAPABILITY_PATH) {
              _context5.next = 21;
              break;
            }

            additionalCapabilities = {};
            _context5.prev = 11;
            _context5.next = 14;
            return _getAdditionalCapabilities(PROCESS_ENVIRONMENT.LT_CAPABILITY_PATH);

          case 14:
            additionalCapabilities = _context5.sent;
            _context5.next = 20;
            break;

          case 17:
            _context5.prev = 17;
            _context5.t0 = _context5["catch"](11);
            additionalCapabilities = {};

          case 20:
            capabilities[id] = (0, _extends2["default"])({}, capabilities[id], additionalCapabilities[capability]);

          case 21:
            if (PROCESS_ENVIRONMENT.LT_BUILD) capabilities[id].build = PROCESS_ENVIRONMENT.LT_BUILD;
            capabilities[id].name = PROCESS_ENVIRONMENT.LT_TEST_NAME || "TestCafe test run " + id;

            if (!PROCESS_ENVIRONMENT.LT_TUNNEL_NAME) {
              _context5.next = 27;
              break;
            }

            capabilities[id].tunnelName = PROCESS_ENVIRONMENT.LT_TUNNEL_NAME;
            _context5.next = 50;
            break;

          case 27:
            _context5.prev = 27;
            _context5.t1 = connectorInstance;

            if (!_context5.t1) {
              _context5.next = 33;
              break;
            }

            _context5.next = 32;
            return connectorInstance.isRunning();

          case 32:
            _context5.t1 = _context5.sent;

          case 33:
            _isRunning = _context5.t1;

            if (_isRunning) {
              _context5.next = 41;
              break;
            }

            _context5.next = 37;
            return _destroy();

          case 37:
            retryCounter = 60;
            isRunning = false;
            _context5.next = 41;
            return _connect();

          case 41:
            _context5.next = 43;
            return connectorInstance.getTunnelName();

          case 43:
            capabilities[id].tunnelName = _context5.sent;
            _context5.next = 50;
            break;

          case 46:
            _context5.prev = 46;
            _context5.t2 = _context5["catch"](27);
            showTrace('_parseCapabilities Error on isRunning check error :', _context5.t2);
            return _context5.abrupt("return", new Error(_context5.t2));

          case 50:
            if (PROCESS_ENVIRONMENT.LT_RESOLUTION) capabilities[id].resolution = PROCESS_ENVIRONMENT.LT_RESOLUTION;
            if (PROCESS_ENVIRONMENT.LT_SELENIUM_VERSION) capabilities[id]['selenium_version'] = PROCESS_ENVIRONMENT.LT_SELENIUM_VERSION;
            if (PROCESS_ENVIRONMENT.LT_CONSOLE) capabilities[id].console = true;
            if (PROCESS_ENVIRONMENT.LT_NETWORK) capabilities[id].network = true;
            if (PROCESS_ENVIRONMENT.LT_VIDEO) capabilities[id].video = true;
            if (PROCESS_ENVIRONMENT.LT_SCREENSHOT) capabilities[id].visual = true;
            if (PROCESS_ENVIRONMENT.LT_TIMEZONE) capabilities[id].timezone = PROCESS_ENVIRONMENT.LT_TIMEZONE;
            if (PROCESS_ENVIRONMENT.LT_W3C === true || PROCESS_ENVIRONMENT.LT_W3C === 'true') capabilities[id].w3c = true;
            if (capabilities[id].version === 'any') delete capabilities[id].version;
            if (capabilities[id].platform === 'any') delete capabilities[id].platform;
            showTrace('Parsed Capabilities ', capabilities[id]);
            return _context5.abrupt("return", capabilities[id]);

          case 64:
            _context5.prev = 64;
            _context5.t3 = _context5["catch"](0);
            showTrace('util._parseCapabilities error :', _context5.t3);
            return _context5.abrupt("return", new Error(_context5.t3));

          case 68:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[0, 64], [11, 17], [27, 46]]);
  }));
  return _parseCapabilities2.apply(this, arguments);
}

function _updateJobStatus(_x4, _x5, _x6, _x7) {
  return _updateJobStatus2.apply(this, arguments);
}

function _updateJobStatus2() {
  _updateJobStatus2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(sessionID, jobResult, jobData, possibleResults) {
    var testsFailed, jobPassed, errorReason, options;
    return _regenerator["default"].wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            showTrace('Update Test Status called for ', sessionID);
            testsFailed = jobResult === possibleResults.done ? jobData.total - jobData.passed : 0;
            jobPassed = jobResult === possibleResults.done && testsFailed === 0;
            errorReason = '';
            if (testsFailed > 0) errorReason = testsFailed + ' tests failed';else if (jobResult === possibleResults.errored) errorReason = jobData.message;else if (jobResult === possibleResults.aborted) errorReason = 'Session aborted';
            options = {
              method: 'PATCH',
              uri: AUTOMATION_BASE_URL + "/sessions/" + sessionID,
              headers: {
                'Authorization': "Basic " + Buffer.from(PROCESS_ENVIRONMENT.LT_USERNAME + ':' + PROCESS_ENVIRONMENT.LT_ACCESS_KEY).toString('base64'),
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'client': 'testcafe'
              },
              body: {
                'status_ind': jobPassed ? 'passed' : 'failed',
                'reason': errorReason
              },
              json: true
            };
            _context6.next = 8;
            return requestApi(options);

          case 8:
            return _context6.abrupt("return", _context6.sent);

          case 9:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));
  return _updateJobStatus2.apply(this, arguments);
}

function _waitForTunnelRunning() {
  return _waitForTunnelRunning2.apply(this, arguments);
}

function _waitForTunnelRunning2() {
  _waitForTunnelRunning2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
    return _regenerator["default"].wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            if (isRunning) {
              _context7.next = 10;
              break;
            }

            _context7.next = 3;
            return sleep(1000);

          case 3:
            retryCounter--;
            _context7.next = 6;
            return connectorInstance.isRunning();

          case 6:
            isRunning = _context7.sent;
            if (retryCounter <= 0) isRunning = true;
            _context7.next = 0;
            break;

          case 10:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _waitForTunnelRunning2.apply(this, arguments);
}

function _saveFile(screenshotPath, base64Data) {
  return new _pinkie["default"](function (resolve, reject) {
    _fs["default"].writeFile(screenshotPath, base64Data, 'base64', function (err) {
      return err ? reject(err) : resolve();
    });
  });
}

function _getAdditionalCapabilities(filename) {
  return new _pinkie["default"](function (resolve, reject) {
    _fs["default"].readFile(filename, 'utf8', function (err, data) {
      return err ? reject(err) : resolve(JSON.parse(data));
    });
  });
}

function sleep(ms) {
  return new _pinkie["default"](function (resolve) {
    setTimeout(resolve, ms);
  });
}

function showTrace(message, data) {
  /*eslint no-console: ["error", { allow: ["warn", "log", "error"] }] */
  if (isTraceEnable) {
    console.log(message);
    if (data) console.log(data);
  }
}

var _default = {
  LT_AUTH_ERROR: LT_AUTH_ERROR,
  PROCESS_ENVIRONMENT: PROCESS_ENVIRONMENT,
  AUTOMATION_DASHBOARD_URL: AUTOMATION_DASHBOARD_URL,
  AUTOMATION_HUB_URL: AUTOMATION_HUB_URL,
  _connect: _connect,
  _destroy: _destroy,
  _getBrowserList: _getBrowserList,
  _parseCapabilities: _parseCapabilities,
  _saveFile: _saveFile,
  _updateJobStatus: _updateJobStatus,
  showTrace: showTrace
};
exports["default"] = _default;
module.exports = exports.default;