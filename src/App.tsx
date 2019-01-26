import React from 'react';
import Weather from './widgets/Weather';
import NextTrip from './widgets/NextTrip';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Weather />
        <NextTrip />
      </div>
    );
  }
}

export default App;
