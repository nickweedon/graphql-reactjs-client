export default {
  mocha: {
    testTimeout: 60000,
  },
  selenium: {
    enableLogging: false,
    launchXVFB: false,
  },
  screenshots: {
    enableSuccessScreenshot: true,
    successPath: './reports/screenshots/pass',
    enableFailureScreenshot: true,
    failPath: './reports/screenshots/fail',
  },
  client: {
    silent: true,
    desiredCapabilities: { // use Chrome as the default browser for tests
      browserName: 'chrome',
      chromeOptions: {
        args: ['--no-sandbox'], // Required to run under a Linux docker image
      },
    },
    end_session_on_fail: false,
    screenshots: {
      enabled: true, // if you want to keep screenshots
      path: './reports/screenshots/fail', // Note that screenshot 'path' will not work when running within mocha
    },
  },
};
