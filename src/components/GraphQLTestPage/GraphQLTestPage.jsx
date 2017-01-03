import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './GraphQLTestPage.scss';
import { FreeFormGraphQLAction, QueryTextChangeAction } from '../../actions/TestGraphQLActions';

const mapStateToProps = state => ({
  responseOK: state.responseOK,
  queryText: state.queryText,
  queryResponse: JSON.stringify(state.graphQLResponse),
});

const mapDispatchToProps = dispatcher => ({
  dispatchQuery: (query) => {
    new FreeFormGraphQLAction(query).dispatch(dispatcher);
  },
  onQueryTextChange: (event) => {
    new QueryTextChangeAction(event.target.value).dispatch(dispatcher);
  },
});

class GraphQLTestPage extends Component {

  constructor (props, context) {
    super(props, context);
  }

  // noinspection JSUnusedGlobalSymbols
  static propTypes = {
    title: PropTypes.string,
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string,
    }),
    queryText: PropTypes.string,
    queryResponse: PropTypes.string,
    onQueryTextChange: PropTypes.func,
    dispatchQuery: PropTypes.func,
  };

  // noinspection JSUnusedGlobalSymbols
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
    store: React.PropTypes.object.isRequired,
  };

  onSubmitClick() {
    this.props.dispatchQuery(this.props.queryText);
  }

//{hello age}
  render() {
    this.context.onSetTitle('About');

    const content = <div dangerouslySetInnerHTML={{ __html: this.props.queryResponse || '' }} />;

    return (
      <div className={s.root}>
        <div className={s.container}>
          {content}
        </div>
        <input type='text' name='graphQLQuery' placeholder='GraphQL Query' defaultValue={this.props.queryText} onChange={this.props.onQueryTextChange} />
        <button onClick={() => { this.onSubmitClick(); }}>
          Submit Query
        </button>
      </div>
    );
  }
}

const GraphQLTestPageConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
)(GraphQLTestPage);

GraphQLTestPage.defaultProps = {
  queryText: '{hello age}',
};

export default withStyles(s)(GraphQLTestPageConnect);
