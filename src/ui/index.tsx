/* 
 * index.tsx: entry point and composition root for React app 
 *   ignored by Istanbul
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'

declare var module: { hot: any };

import { Client, ClientImpl } from './client'
import { TestRunList } from './TestRunList'

const styles = require('./index.scss')

const client = new ClientImpl('http://localhost:8080/api')
const store = new TestRunList(client)

var render = () => {
  const App = require('./app').App
  ReactDOM.render(
    <App store={store} />,
    document.getElementById("react-root")
  );
}

if (module.hot) {
  render = () => {
    const AppContainer = require('react-hot-loader').AppContainer
    const App = require('./app').App

    ReactDOM.render(
      <AppContainer>
        <App store={store} />
      </AppContainer>,
      document.getElementById("react-root")
    );
  }

  // Hot Module Replacement
  module.hot.accept('./app', render)
}


render();
