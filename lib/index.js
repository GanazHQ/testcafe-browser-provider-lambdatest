'use strict';

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

exports.__esModule = true;
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

var _webdriver = _interopRequireDefault(require("webdriver"));

var _util = require("./util");

var WEB_DRIVER_PING_INTERVAL = 30 * 1000; // timeout: 15 * 60 * 1000,

var openedBrowsers = {};

var sleep = function sleep(delay) {
  return new _promise["default"](function (resolve) {
    return setTimeout(function () {
      resolve();
    }, delay);
  });
};

var _default = {
  isMultiBrowser: true,
  browserNames: [],
  _startBrowser: function _startBrowser(id, url, capabilities) {
    var _this = this;

    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var browser;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              (0, _util.showTrace)('StartBrowser Initiated for ', id);
              _context.next = 3;
              return _webdriver["default"].newSession({
                path: '/wd/hub',
                hostname: 'hub.lambdatest.com',
                port: 80,
                protocol: 'http',
                user: _util.PROCESS_ENVIRONMENT.LT_USERNAME,
                key: _util.PROCESS_ENVIRONMENT.LT_ACCESS_KEY,
                capabilities: capabilities,
                logLevel: _util.PROCESS_ENVIRONMENT.LT_ENABLE_TRACE ? 'info' : 'silent'
              });

            case 3:
              browser = _context.sent;
              openedBrowsers[id] = browser;
              (0, _util.showTrace)(capabilities);
              _context.prev = 6;
              _context.next = 9;
              return browser.navigateTo(url);

            case 9:
              _context.next = 18;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](6);
              _context.next = 15;
              return (0, _util._destroy)();

            case 15:
              (0, _util.showTrace)('Error while starting browser for ', id);
              (0, _util.showTrace)(_context.t0);
              throw _context.t0;

            case 18:
              // no need to await on this
              if (WEB_DRIVER_PING_INTERVAL > 0) _this._startHeartbeat(id, WEB_DRIVER_PING_INTERVAL);

            case 19:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[6, 11]]);
    }))();
  },
  _takeScreenshot: function _takeScreenshot(id, screenshotPath) {
    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      var base64Data;
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return openedBrowsers[id].takeScreenshot();

            case 2:
              base64Data = _context2.sent;
              _context2.next = 5;
              return (0, _util._saveFile)(screenshotPath, base64Data);

            case 5:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }))();
  },
  _startHeartbeat: function _startHeartbeat(id, interval) {
    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
      var browser;
      return _regenerator["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              browser = openedBrowsers[id];
              openedBrowsers[id].heartbeat = true;

            case 2:
              if (!openedBrowsers[id].heartbeat) {
                _context3.next = 18;
                break;
              }

              _context3.prev = 3;
              (0, _util.showTrace)('Ping...');
              _context3.next = 7;
              return browser.getTitle();

            case 7:
              (0, _util.showTrace)('Successful ping!');
              _context3.next = 14;
              break;

            case 10:
              _context3.prev = 10;
              _context3.t0 = _context3["catch"](3);
              // ignore
              (0, _util.showTrace)('ping error :');
              (0, _util.showTrace)(_context3.t0);

            case 14:
              _context3.next = 16;
              return sleep(interval);

            case 16:
              _context3.next = 2;
              break;

            case 18:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[3, 10]]);
    }))();
  },
  _stopHeartbeat: function _stopHeartbeat(id) {
    openedBrowsers[id].heartbeat = false;
  },
  // Required - must be implemented
  // Browser control
  openBrowser: function openBrowser(id, pageUrl, browserName) {
    var _this2 = this;

    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
      var capabilities;
      return _regenerator["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!(!_util.PROCESS_ENVIRONMENT.LT_USERNAME || !_util.PROCESS_ENVIRONMENT.LT_ACCESS_KEY)) {
                _context4.next = 2;
                break;
              }

              throw new Error(_util.LT_AUTH_ERROR);

            case 2:
              _context4.next = 4;
              return (0, _util._connect)();

            case 4:
              _context4.next = 6;
              return (0, _util._parseCapabilities)(id, browserName);

            case 6:
              capabilities = _context4.sent;

              if (!(capabilities instanceof Error)) {
                _context4.next = 12;
                break;
              }

              (0, _util.showTrace)('openBrowser error on  _parseCapabilities', capabilities);
              _context4.next = 11;
              return _this2.dispose();

            case 11:
              throw capabilities;

            case 12:
              _context4.next = 14;
              return _this2._startBrowser(id, pageUrl, capabilities);

            case 14:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }))();
  },
  closeBrowser: function closeBrowser(id) {
    var _this3 = this;

    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
      return _regenerator["default"].wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              (0, _util.showTrace)('closeBrowser Initiated for ', id);

              if (!openedBrowsers[id]) {
                _context5.next = 19;
                break;
              }

              (0, _util.showTrace)(openedBrowsers[id].sessionId);

              _this3._stopHeartbeat(id);

              if (!openedBrowsers[id].sessionId) {
                _context5.next = 15;
                break;
              }

              _context5.prev = 5;
              _context5.next = 8;
              return openedBrowsers[id].deleteSession();

            case 8:
              _context5.next = 13;
              break;

            case 10:
              _context5.prev = 10;
              _context5.t0 = _context5["catch"](5);
              (0, _util.showTrace)(_context5.t0);

            case 13:
              _context5.next = 17;
              break;

            case 15:
              (0, _util.showTrace)('SessionID not found for ', id);
              (0, _util.showTrace)(openedBrowsers[id]);

            case 17:
              _context5.next = 20;
              break;

            case 19:
              (0, _util.showTrace)('Browser not found in OPEN STATE for ', id);

            case 20:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, null, [[5, 10]]);
    }))();
  },
  // Optional - implement methods you need, remove other methods
  // Initialization
  init: function init() {
    var _this4 = this;

    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return (0, _util._getBrowserList)();

            case 2:
              _this4.browserNames = _context6.sent;

            case 3:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }))();
  },
  dispose: function dispose() {
    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              (0, _util.showTrace)('Dispose Initiated ...');
              _context7.prev = 1;
              _context7.next = 4;
              return (0, _util._destroy)();

            case 4:
              _context7.next = 10;
              break;

            case 6:
              _context7.prev = 6;
              _context7.t0 = _context7["catch"](1);
              (0, _util.showTrace)('Error while destroying ...');
              (0, _util.showTrace)(_context7.t0);

            case 10:
              (0, _util.showTrace)('Dispose Completed');

            case 11:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7, null, [[1, 6]]);
    }))();
  },
  // Browser names handling
  getBrowserList: function getBrowserList() {
    var _this5 = this;

    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
      return _regenerator["default"].wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              return _context8.abrupt("return", _this5.browserNames);

            case 1:
            case "end":
              return _context8.stop();
          }
        }
      }, _callee8);
    }))();
  },
  isValidBrowserName: function isValidBrowserName()
  /* browserName */
  {
    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9() {
      return _regenerator["default"].wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              return _context9.abrupt("return", true);

            case 1:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9);
    }))();
  },
  // Extra methods
  resizeWindow: function resizeWindow(id, width, height) {
    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10() {
      return _regenerator["default"].wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              _context10.next = 2;
              return openedBrowsers[id].setWindowSize(width, height);

            case 2:
            case "end":
              return _context10.stop();
          }
        }
      }, _callee10);
    }))();
  },
  maximizeWindow: function maximizeWindow(id) {
    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11() {
      return _regenerator["default"].wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return openedBrowsers[id].maximizeWindow();

            case 2:
            case "end":
              return _context11.stop();
          }
        }
      }, _callee11);
    }))();
  },
  takeScreenshot: function takeScreenshot(id, screenshotPath) {
    var _this6 = this;

    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12() {
      return _regenerator["default"].wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              _context12.next = 2;
              return _this6._takeScreenshot(id, screenshotPath);

            case 2:
            case "end":
              return _context12.stop();
          }
        }
      }, _callee12);
    }))();
  },
  reportJobResult: function reportJobResult(id, jobResult, jobData) {
    var _this7 = this;

    return (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13() {
      var sessionID;
      return _regenerator["default"].wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              if (!(openedBrowsers[id] && openedBrowsers[id].sessionId)) {
                _context13.next = 5;
                break;
              }

              sessionID = openedBrowsers[id].sessionId; // FIXME: this.JOB_RESULT is undefined!

              _context13.next = 4;
              return (0, _util._updateJobStatus)(sessionID, jobResult, jobData, _this7.JOB_RESULT);

            case 4:
              return _context13.abrupt("return", _context13.sent);

            case 5:
              return _context13.abrupt("return", null);

            case 6:
            case "end":
              return _context13.stop();
          }
        }
      }, _callee13);
    }))();
  }
};
exports["default"] = _default;
module.exports = exports.default;