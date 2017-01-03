import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import uuid from 'node-uuid';
import emptyFunction from 'fbjs/lib/emptyFunction';
import s from './App.scss';
import Header from '../Header/Header';
import Feedback from '../Feedback/Feedback';
import Footer from '../Footer/Footer';
import fetch from '../../core/fetch';
import { GraphQLResponseAction } from '../../actions/GraphQLActions';

const mapStateToProps = state => ({
  content: state.content,
  responseOK: state.responseOK,
});

const mapDispatchToProps = dispatcher => ({
  dispatchResponseAction: (type, response) => {
    new GraphQLResponseAction(type, response).dispatch(dispatcher);
  },
});

class App extends Component {

  constructor() {
    super();
    this.isRunning = false;
  }

  // noinspection JSUnusedGlobalSymbols
  static propTypes = {
    children: PropTypes.element.isRequired,
    dispatchResponseAction: PropTypes.func,
  };

  // noinspection JSUnusedGlobalSymbols
  static childContextTypes = {
    insertCss: PropTypes.func.isRequired,
    onSetTitle: PropTypes.func.isRequired,
    onSetMeta: PropTypes.func.isRequired,
    onPageNotFound: PropTypes.func.isRequired,
  };

  static getUUID() {
    if (window === undefined) {
      return '';
    }
    if (window.uuid === undefined) {
      window.uuid = uuid.v4();
    }
    return window.uuid;
  }

  // Continually fetch action responses from the server
  async fetchActions() {
    try {
      const url = '/response?uuid=' + encodeURIComponent(App.getUUID());
      const response = await fetch(url);

      if (response.ok && response.status !== 204) {
        const jsonResult = await response.json();

        jsonResult.forEach((value) => {
          this.props.dispatchResponseAction(value.type, value.response);
        });
      }
    } catch(e) {
      console.error("Error: ", e);
      // Ignore any error and try again
      setTimeout(() => {
        this.fetchActions();
      }, 2000);
      return;
    }
    setTimeout(() => {
      this.fetchActions();
    }, 10);
  }

  static createContext() {
    return {
      insertCss: styles => styles._insertCss(),
      onSetTitle: value => (document.title = value),
      onSetMeta: (name, content) => {
        // Remove and create a new <meta /> tag in order to make it work
        // with bookmarks in Safari
        const elements = document.getElementsByTagName('meta');
        Array.from(elements).forEach((element) => {
          if (element.getAttribute('name') === name) {
            element.parentNode.removeChild(element);
          }
        });
        const meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document
          .getElementsByTagName('head')[0]
          .appendChild(meta);
      },
    };
  }

  // noinspection JSUnusedGlobalSymbols
  getChildContext() {
    const context = App.createContext();
    return {
      insertCss: context.insertCss || emptyFunction,
      onSetTitle: context.onSetTitle || emptyFunction,
      onSetMeta: context.onSetMeta || emptyFunction,
      onPageNotFound: context.onPageNotFound || emptyFunction,
    };
  }

  componentWillMount() {
    const { insertCss } = App.createContext();
    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentDidMount() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.fetchActions();
    }
  }

  render() {
    return (
      <div>
        <Header />
        {this.props.children}
        <Feedback />
        <Footer />
      </div>
    );
  }

}

const AppConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);

export default AppConnect;

