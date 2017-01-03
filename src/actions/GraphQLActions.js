import uuid from 'node-uuid';
import Action from './Action';
import fetch from '../core/fetch';

class GraphQLRequestAction extends Action {

  constructor(actionType, graphQLRequest) {
    super(actionType);
    this.graphQLRequest = graphQLRequest;
  }

  static getUUID() {
    if (window === undefined) {
      return '';
    }
    if (window.uuid === undefined) {
      window.uuid = uuid.v4();
    }
    return window.uuid;
  }

  async dispatch(dispatcher) {
    // TODO: Check return code for error

    dispatcher({ type: `${this.type}_REQUEST`, request: this.graphQLRequest });

    await fetch('/action', {
      method: 'POST',
      headers: { 'Content-Type' : 'application/json' },
      body: JSON.stringify({
        type: this.type,
        request: this.graphQLRequest,
        uuid: GraphQLRequestAction.getUUID(),
      }),
    });
  }
}

class GraphQLResponseAction extends Action {
  constructor(actionType, response) {
    super(`${actionType}_RESPONSE`);
    this.response = response;
  }
}

export { GraphQLRequestAction, GraphQLResponseAction };
