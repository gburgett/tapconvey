import * as React from 'react'
import * as ReactDOM from 'react-dom'

declare var module: { hot: any };

var render = () => {
  const App = require('./app').App
  ReactDOM.render(
    <App />,
    document.getElementById("react-root")
  );
}

if (module.hot) {
  render = () => {
    const AppContainer = require('react-hot-loader').AppContainer
    const App = require('./app').App

    ReactDOM.render(
      <AppContainer>
        <App />
      </AppContainer>,
      document.getElementById("react-root")
    );
  }

  // Hot Module Replacement
  module.hot.accept('./app', render)
}


render();
