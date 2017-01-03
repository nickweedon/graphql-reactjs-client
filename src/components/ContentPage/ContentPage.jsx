import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ContentPage.scss';
import { LoadContentAction } from '../../actions/LoadContentActions';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import ErrorPage from '../ErrorPage/ErrorPage';

const mapStateToProps = state => ({
  content: state.content,
  responseOK: state.responseOK,
});

const mapDispatchToProps = dispatcher => ({
  onLoadClick: (contentPath) => {
    new LoadContentAction(contentPath).dispatch(dispatcher);
  },
});

class ContentPage extends Component {

  // noinspection JSUnusedGlobalSymbols
  static propTypes = {
    title: PropTypes.string,
    location: React.PropTypes.shape({
      pathname: React.PropTypes.string,
    }),
    responseOK: PropTypes.bool,
    content: PropTypes.string,
    path: PropTypes.string,
    onLoadClick: PropTypes.func,
  };

  // noinspection JSUnusedGlobalSymbols
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
    store: React.PropTypes.object.isRequired,
  };

  componentWillMount() {
    const loadContentAction = new LoadContentAction(this.props.location.pathname);
    loadContentAction.dispatch(this.context.store.dispatch);
  }

  render() {
    this.context.onSetTitle('About');

    let content;

    if (!this.props.responseOK) {
      content = <ErrorPage />;
    } else if (!this.props.content) {
      content = <NotFoundPage />;
    } else {
      content = <div dangerouslySetInnerHTML={{ __html: this.props.content || '' }} />;
    }

    return (
      <div className={s.root}>
        <div className={s.container}>
          {this.props.path === '/' ? null : <h1>{this.props.title}</h1>}
          {content}
        </div>
        <button onClick={() => { this.props.onLoadClick(this.props.location.pathname); }}>
          Reload Content
        </button>
      </div>
    );
  }
}

const ContentPageConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ContentPage);

export default withStyles(s)(ContentPageConnect);

