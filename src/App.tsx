import React from 'react';
import WeatherWidget from './widgets/WeatherWidget';
import NextTripWidget from './widgets/NextTripWidget';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <WeatherWidget />
        <NextTripWidget />
      </div>
    );
  }
}

export default App;
