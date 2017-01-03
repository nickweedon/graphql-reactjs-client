

const initialState = {
  content: '',
  loading: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'CONTENT_LOAD_CONTENT_REQUEST':
      return {
        ...state,
        responseOK: null,
        loading: true,
      };
    case 'CONTENT_LOAD_CONTENT_RESPONSE':
      return {
        ...state,
        loading: false,
        responseOK: true,
        content: action.response.content,
      };
    case 'CONTENT_LOAD_CONTENT_ERROR':
      return {
        ...state,
        loading: false,
        responseOK: false,
        content: null,
      };
    case 'QUERY_TEXT_CHANGE':
      return {
        ...state,
        queryText: action.text,
      };
    case 'TEST_GRAPHQL_REQUEST':
      return {
        ...state,
        graphQLRequest: action.graphQLRequest,
      };
    case 'TEST_GRAPHQL_RESPONSE':
      return {
        ...state,
        graphQLResponse: action.response,
      };
    default:
      return state;
  }
};
