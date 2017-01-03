import TestHelper, { client, browser } from '../../tools/integrationTestHelper';

describe('Test About', function () {
  TestHelper.handleInit(this);

  before(function (done) {
    TestHelper.handleBefore(this, done);
  });

  it('Has correct about title on direct load', function (done) {
    browser
      .url('http://localhost:3001/about')
      .waitForElementVisible('body', 5000)
      .assert.title('About');

    client.start(done);
  });

  it('Has correct about title on link load', function (done) {
    browser
      .url('http://localhost:3001/')
      .waitForElementVisible('body', 5000)
      .useXpath()     // every selector now must be XPath
      .click("//a[text()='About']")
      .useCss()
      .assert.title('About');

    client.start(done);
  });

  afterEach(function (done) {
    TestHelper.handleAfterEach(this, done);
  });

  after(function (done) {
    TestHelper.handleAfter(this, done);
  });
});
