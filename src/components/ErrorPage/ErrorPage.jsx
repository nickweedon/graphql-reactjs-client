import React, { Component, PropTypes } from 'react';

const title = 'Error';

class ErrorPage extends Component {

  // noinspection JSUnusedGlobalSymbols
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
    onPageNotFound: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.context.onSetTitle(title);
  }

  render() {
    return (
      <div>
        <h1>{title}</h1>
        <p>Sorry, an critical error occurred on this page.</p>
      </div>
    );
  }

}

export default ErrorPage;
