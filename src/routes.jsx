import React from 'react';
import { IndexRoute, Router, Route, browserHistory } from 'react-router';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App/App';
import ContentPage from './components/ContentPage/ContentPage';
import ContactPage from './components/ContactPage/ContactPage';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import GraphQLTestPage from './components/GraphQLTestPage/GraphQLTestPage';
import rootStore from './stores/rootStore';

class AppRouter {
  static render(container) {
    ReactDOM.render((
      <Provider store={rootStore}>
        <Router history={browserHistory}>
          <Route path="/" component={App}>
            <IndexRoute component={ContactPage} />
            <Route path="/contact" component={ContactPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/testgraphql" component={GraphQLTestPage} />
            <Route path="/*" component={ContentPage} />
          </Route>
        </Router>
      </Provider>
      ),
      container,
    );
  }
}


export default AppRouter;
