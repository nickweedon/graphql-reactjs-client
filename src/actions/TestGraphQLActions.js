import { GraphQLRequestAction } from './GraphQLActions';
import Action from './Action';

class FreeFormGraphQLAction extends GraphQLRequestAction {
  constructor(graphQLQuery) {
    super('TEST_GRAPHQL', graphQLQuery);
  }
}

class QueryTextChangeAction extends Action {
  constructor(text) {
    super('QUERY_TEXT_CHANGE');
    this.text = text;
  }
}


export { FreeFormGraphQLAction, QueryTextChangeAction };
