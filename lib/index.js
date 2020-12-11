'use strict';

exports.__esModule = true;
exports.default = void 0;

var _webdriver = _interopRequireDefault(require("webdriver"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const WEB_DRIVER_PING_INTERVAL = 30 * 1000; // timeout: 15 * 60 * 1000,

const openedBrowsers = {};

const sleep = delay => new Promise(resolve => setTimeout(() => {
  resolve();
}, delay));

var _default = {
  isMultiBrowser: true,
  browserNames: [],

  async _startBrowser(id, url, capabilities) {
    (0, _util.showTrace)('StartBrowser Initiated for ', id);
    console.log('Capabilities', capabilities);
    const browser = await _webdriver.default.newSession({
      path: '/wd/hub',
      hostname: 'hub.lambdatest.com',
      port: 80,
      protocol: 'http',
      user: _util.PROCESS_ENVIRONMENT.LT_USERNAME,
      key: _util.PROCESS_ENVIRONMENT.LT_ACCESS_KEY,
      capabilities,
      logLevel: _util.PROCESS_ENVIRONMENT.LT_ENABLE_TRACE ? 'info' : 'silent'
    });
    openedBrowsers[id] = browser;
    (0, _util.showTrace)(capabilities);

    try {
      //if (capabilities.acceptSslCerts) await browser.navigateTo('javascript:document.getElementById(\'overridelink\').click()');
      await browser.navigateTo(url);
    } catch (err) {
      await (0, _util._destroy)();
      (0, _util.showTrace)('Error while starting browser for ', id);
      (0, _util.showTrace)(err);
      throw err;
    } // no need to await on this


    if (WEB_DRIVER_PING_INTERVAL > 0) this._startHeartbeat(id, WEB_DRIVER_PING_INTERVAL);
  },

  async _takeScreenshot(id, screenshotPath) {
    const base64Data = await openedBrowsers[id].takeScreenshot();
    await (0, _util._saveFile)(screenshotPath, base64Data);
  },

  async _startHeartbeat(id, interval) {
    const browser = openedBrowsers[id];
    openedBrowsers[id].heartbeat = true;

    while (openedBrowsers[id].heartbeat) {
      try {
        (0, _util.showTrace)('Ping...');
        await browser.getTitle();
        (0, _util.showTrace)('Successful ping!');
      } catch (err) {
        // ignore
        (0, _util.showTrace)('ping error :');
        (0, _util.showTrace)(err);
      } // sleep


      await sleep(interval);
    }
  },

  _stopHeartbeat(id) {
    openedBrowsers[id].heartbeat = false;
  },

  // Required - must be implemented
  // Browser control
  async openBrowser(id, pageUrl, browserName) {
    if (!_util.PROCESS_ENVIRONMENT.LT_USERNAME || !_util.PROCESS_ENVIRONMENT.LT_ACCESS_KEY) throw new Error(_util.LT_AUTH_ERROR);
    await (0, _util._connect)();
    const capabilities = await (0, _util._parseCapabilities)(id, browserName);

    if (capabilities instanceof Error) {
      (0, _util.showTrace)('openBrowser error on  _parseCapabilities', capabilities);
      await this.dispose();
      throw capabilities;
    }

    await this._startBrowser(id, pageUrl, capabilities); // TODO: Is this needed or just a way for testcafe code to find the session URL?
    // const sessionUrl = ` ${AUTOMATION_DASHBOARD_URL}/logs/?sessionID=${openedBrowsers[id].sessionID} `;
    // this.setUserAgentMetaInfo(id, sessionUrl);
  },

  async closeBrowser(id) {
    (0, _util.showTrace)('closeBrowser Initiated for ', id);

    if (openedBrowsers[id]) {
      (0, _util.showTrace)(openedBrowsers[id].sessionId);

      this._stopHeartbeat(id);

      if (openedBrowsers[id].sessionId) {
        try {
          await openedBrowsers[id].deleteSession(); //quit();
        } catch (err) {
          (0, _util.showTrace)(err);
        }
      } else {
        (0, _util.showTrace)('SessionID not found for ', id);
        (0, _util.showTrace)(openedBrowsers[id]);
      }
    } else (0, _util.showTrace)('Browser not found in OPEN STATE for ', id);
  },

  // Optional - implement methods you need, remove other methods
  // Initialization
  async init() {
    this.browserNames = await (0, _util._getBrowserList)();
  },

  async dispose() {
    (0, _util.showTrace)('Dispose Initiated ...');

    try {
      await (0, _util._destroy)();
    } catch (err) {
      (0, _util.showTrace)('Error while destroying ...');
      (0, _util.showTrace)(err);
    }

    (0, _util.showTrace)('Dispose Completed');
  },

  // Browser names handling
  async getBrowserList() {
    return this.browserNames;
  },

  async isValidBrowserName()
  /* browserName */
  {
    return true;
  },

  // Extra methods
  async resizeWindow(id, width, height) {
    await openedBrowsers[id].setWindowSize(width, height);
  },

  async maximizeWindow(id) {
    await openedBrowsers[id].maximizeWindow();
  },

  async takeScreenshot(id, screenshotPath) {
    await this._takeScreenshot(id, screenshotPath);
  },

  async reportJobResult(id, jobResult, jobData) {
    if (openedBrowsers[id] && openedBrowsers[id].sessionId) {
      const sessionID = openedBrowsers[id].sessionId; // FIXME: this.JOB_RESULT is undefined!

      return await (0, _util._updateJobStatus)(sessionID, jobResult, jobData, this.JOB_RESULT);
    }

    return null;
  }

};
exports.default = _default;
module.exports = exports.default;