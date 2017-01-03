import { spy } from 'sinon';
import { assert } from 'chai';
import AsyncRequestResponseAction from '../../src/actions/AsyncRequestResponseAction';

class TestAction extends AsyncRequestResponseAction {
  constructor(done) {
    super('ASYNC_TEST', 100, request => new Promise((resolve) => {
      setTimeout(() => { resolve('Hello'); done(); }, request);
    }));
  }
}

describe('Action Test Suite', function () {
  let requestResponse;

  it('Should dispatch with suffixed action type', function (done) {
    const mockDispatcher = spy();

    requestResponse = new TestAction(() => {
      setTimeout(() => {
        assert.isTrue(mockDispatcher.calledWithMatch({ type: 'ASYNC_TEST_REQUEST' }));
        assert.isTrue(mockDispatcher.calledWithMatch({ type: 'ASYNC_TEST_RESPONSE' }));
      }, 10);
      done();
    });

    requestResponse.dispatch(mockDispatcher);
  });
});
