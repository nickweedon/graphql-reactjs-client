import Action from './Action';

class AsyncRequestResponseAction extends Action {

  constructor(actionType, request, asyncFunction) {
    super(actionType);
    this.request = request;
    this.asyncFunction = asyncFunction;
  }

  async asyncDispatch(dispatcher) {
    try {
      const result = await this.asyncFunction(this.request);
      dispatcher({ type: `${this.type}_RESPONSE`, request: this.request, response: result });
    } catch (e) {
      dispatcher({ type: `${this.type}_ERROR`, request: this.request, error: e });
    }
  }

  dispatch(dispatcher) {
    dispatcher({ type: `${this.type}_REQUEST`, request: this.request });

    // noinspection JSIgnoredPromiseFromCall
    this.asyncDispatch(dispatcher);
  }
}

export default AsyncRequestResponseAction;
