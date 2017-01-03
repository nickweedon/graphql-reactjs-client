import 'babel-polyfill';
import FastClick from 'fastclick';
import AppRouter from './routes';

const appContainer = document.getElementById('app');

function render(container) {
  AppRouter.render(container);
}

function run() {
  // Make taps on links and buttons work fast on mobiles
  FastClick.attach(document.body);

  render(appContainer);
}

// Run the application when both DOM is ready and page content is loaded
if (['complete', 'loaded', 'interactive'].includes(document.readyState) && document.body) {
  run();
} else {
  document.addEventListener('DOMContentLoaded', run, false);
}
