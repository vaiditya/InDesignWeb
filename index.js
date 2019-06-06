import './style.css';
import React, { Component } from 'react';
import { render } from 'react-dom';
import metadata from "./metadata";
import Spread from "./Spread";

class App extends Component {
  render() {
    return (
      <div className="container">
        {Object.keys(metadata).map(spreads => <Spread key={spreads} spreads={spreads}/>)}
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
