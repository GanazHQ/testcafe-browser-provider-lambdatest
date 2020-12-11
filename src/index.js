'use strict';
import WebDriver from 'webdriver';

import { LT_AUTH_ERROR, PROCESS_ENVIRONMENT, _connect, _destroy, _getBrowserList, _parseCapabilities, _saveFile, _updateJobStatus, showTrace } from './util';

const WEB_DRIVER_PING_INTERVAL = 30 * 1000;

// timeout: 15 * 60 * 1000,

const openedBrowsers = {};

const sleep = (delay) => new Promise((resolve) => setTimeout(() => {
    resolve();
}, delay));

export default {
    isMultiBrowser: true,
    browserNames: [],

    async _startBrowser (id, url, capabilities) {
        showTrace('StartBrowser Initiated for ', id);
        console.log('Capabilities', capabilities);
        const browser = await WebDriver.newSession({
            path: '/wd/hub',
            hostname: 'hub.lambdatest.com',
            port: 80,
            protocol: 'http',
            user: PROCESS_ENVIRONMENT.LT_USERNAME,
            key: PROCESS_ENVIRONMENT.LT_ACCESS_KEY,
            capabilities,
            logLevel: PROCESS_ENVIRONMENT.LT_ENABLE_TRACE ? 'info' : 'silent'
        });

        openedBrowsers[id] = browser;
        showTrace(capabilities);
        try {
            //if (capabilities.acceptSslCerts) await browser.navigateTo('javascript:document.getElementById(\'overridelink\').click()');
            await browser.navigateTo(url);
        }
        catch (err) {
            await _destroy();
            showTrace('Error while starting browser for ', id);
            showTrace(err);
            throw err;
        }

        // no need to await on this
        if (WEB_DRIVER_PING_INTERVAL > 0)
            this._startHeartbeat(id, WEB_DRIVER_PING_INTERVAL);
    },

    async _takeScreenshot (id, screenshotPath) {
        const base64Data = await openedBrowsers[id].takeScreenshot();

        await _saveFile(screenshotPath, base64Data);
    },

    async _startHeartbeat (id, interval) {
        const browser = openedBrowsers[id];

        openedBrowsers[id].heartbeat = true;
        while (openedBrowsers[id].heartbeat) {
            try {
                showTrace('Ping...');
                await browser.getTitle();
                showTrace('Successful ping!');
            }
            catch (err) {
                // ignore
                showTrace('ping error :');
                showTrace(err);
            }

            // sleep
            await sleep(interval);
        }
    },

    _stopHeartbeat (id) {
        openedBrowsers[id].heartbeat = false;
    },

    // Required - must be implemented
    // Browser control
    async openBrowser (id, pageUrl, browserName) {
        if (!PROCESS_ENVIRONMENT.LT_USERNAME || !PROCESS_ENVIRONMENT.LT_ACCESS_KEY)
            throw new Error(LT_AUTH_ERROR);
        await _connect();
        const capabilities = await _parseCapabilities(id, browserName);

        if (capabilities instanceof Error) {
            showTrace('openBrowser error on  _parseCapabilities', capabilities);
            await this.dispose();
            throw capabilities;
        }
        await this._startBrowser(id, pageUrl, capabilities);

        // TODO: Is this needed or just a way for testcafe code to find the session URL?
        // const sessionUrl = ` ${AUTOMATION_DASHBOARD_URL}/logs/?sessionID=${openedBrowsers[id].sessionID} `;
        // this.setUserAgentMetaInfo(id, sessionUrl);
    },

    async closeBrowser (id) {
        showTrace('closeBrowser Initiated for ', id);
        if (openedBrowsers[id]) {
            showTrace(openedBrowsers[id].sessionId);
            this._stopHeartbeat(id);
            if (openedBrowsers[id].sessionId) {
                try {
                    await openedBrowsers[id].deleteSession(); //quit();
                }
                catch (err) {
                    showTrace(err);
                }
            }
            else {
                showTrace('SessionID not found for ', id);
                showTrace(openedBrowsers[id]);
            }
        }
        else
            showTrace('Browser not found in OPEN STATE for ', id);
    },

    // Optional - implement methods you need, remove other methods
    // Initialization
    async init () {
        this.browserNames = await _getBrowserList();
    },

    async dispose () {
        showTrace('Dispose Initiated ...');
        try {
            await _destroy();
        }
        catch (err) {
            showTrace('Error while destroying ...');
            showTrace(err);
        }
        showTrace('Dispose Completed');
    },

    // Browser names handling
    async getBrowserList () {
        return this.browserNames;
    },

    async isValidBrowserName (/* browserName */) {
        return true;
    },

    // Extra methods
    async resizeWindow (id, width, height) {
        await openedBrowsers[id].setWindowSize(width, height);
    },

    async maximizeWindow (id) {
        await openedBrowsers[id].maximizeWindow();
    },

    async takeScreenshot (id, screenshotPath) {
        await this._takeScreenshot(id, screenshotPath);
    },

    async reportJobResult (id, jobResult, jobData) {
        if (openedBrowsers[id] && openedBrowsers[id].sessionId) {
            const sessionID = openedBrowsers[id].sessionId;

            // FIXME: this.JOB_RESULT is undefined!
            return await _updateJobStatus(sessionID, jobResult, jobData, this.JOB_RESULT);
        }
        return null;
    }
};
