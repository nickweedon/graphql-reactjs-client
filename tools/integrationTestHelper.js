import selenium from 'selenium-standalone';
import nightwatch from 'nightwatch';
import Xvfb from 'xvfb';
import run from './run';
import startServer from './start';
import fs from 'fs';
import integrationTestConfig from './integration.test.config';

class TestHelper {

  static client = nightwatch.initClient(TestHelper.getClientConfig());
  static browser = TestHelper.client.api();
  static seleniumChildProcess = null;
  static xvfb = null;

  static getSuccessScreenshotFile(title) {
    return `${integrationTestConfig.screenshots.successPath}/${title}.png`;
  }

  static getFailureScreenshotFile(title) {
    return `${integrationTestConfig.screenshots.failPath}/${title}.png`;
  }

  static getScreenshotConfig() {
    return integrationTestConfig.screenshots;
  }

  static getClientConfig() {
    return integrationTestConfig.client;
  }

  static useXVFB() {
    return process.env.USE_XVFB === 'true' || integrationTestConfig.selenium.launchXVFB;
  }

  static async startXVFB() {
    return new Promise((fulfill) => {
      const xvfb = new Xvfb();
      xvfb.start(() => {
        // Add an additional wait to avoid an observed race condition
        setTimeout(() => {
          fulfill(xvfb);
        }, 500);
      });
    });
  }

  static stopSyncXVFB(xvfb) {
    xvfb.stopSync();
  }

  static handleInit(mochaThis) {
    mochaThis.timeout(integrationTestConfig.mocha.testTimeout);
  }

  static async launchDaemons() {
    // Start up the web server
    await startServer({ debug: false });

    if (TestHelper.useXVFB()) {
      TestHelper.xvfb = await TestHelper.startXVFB();
    }
    if (!fs.existsSync('node_modules/selenium-standalone/.selenium')) {
      await TestHelper.installSelenium();
    }
    TestHelper.seleniumChildProcess = await TestHelper.runSelenium();
  }

  static async stopDaemons() {
    await TestHelper.stopSelenium();
    if (TestHelper.xvfb != null) {
      TestHelper.stopSyncXVFB(TestHelper.xvfb);
    }
  }

  static installSelenium() {
    return new Promise((fulfill) => {
      selenium.install({}, () => {
        fulfill();
      });
    });
  }

  static runSelenium() {
    return new Promise((fulfill) => {
      selenium.start((err, child) => {
        if (integrationTestConfig.selenium.enableLogging) {
          child.stderr.on('data', (data) => {
            console.log(data.toString());
          });
        }
        fulfill(child);
      });
    });
  }

  static stopSelenium() {
    return new Promise((fulfill) => {
      if (TestHelper.seleniumChildProcess === undefined) {
        fulfill();
      }
      TestHelper.seleniumChildProcess.on('exit', () => {
        fulfill();
      });
      TestHelper.seleniumChildProcess.kill();
    });
  }

  static async handleBefore(mochaThis, done) {
    await TestHelper.launchDaemons();
    done();
  }

  static handleAfterEach(mochaThis, done) {
    const test = mochaThis.currentTest;
    const passed = test.state === 'passed';

    if (!TestHelper.browser.sessionId) {
      console.log('Session already ended.');
      done();
      return;
    }

    if ((passed && !integrationTestConfig.screenshots.enableSuccessScreenshot)
      || (!passed && !integrationTestConfig.screenshots.enableFailureScreenshot)) {
      done();
      return;
    }

    const fileName = passed
      ? TestHelper.getSuccessScreenshotFile(test.title)
      : TestHelper.getFailureScreenshotFile(test.title);

    TestHelper.browser.saveScreenshot(fileName);
    TestHelper.browser.end();
    TestHelper.client.start(done);
  }

  static endBrowserSession() {
    return new Promise((fulfill) => {
      if (!TestHelper.browser.sessionId) {
        fulfill();
      } else {
        TestHelper.browser.end();
        TestHelper.client.start(fulfill);
      }
    });
  }

  static async handleAfter(mochaThis, done) {
    await TestHelper.endBrowserSession();
    await TestHelper.stopDaemons();
    done();
  }
}

const client = TestHelper.client;
const browser = TestHelper.browser;

export { TestHelper as default, client, browser };
