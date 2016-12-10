import * as React from 'react'
import * as ReactDOM from 'react-dom'

interface AppProps {

}

class App extends React.Component<AppProps, undefined> {
  render() {
    return <h1>This is the app!</h1>;
  }
}

ReactDOM.render(
  <App />,
  document.getElementById("react-root")
);
