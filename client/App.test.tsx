import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const mockGeolocation = {
  getCurrentPosition: jest.fn()
};
(global as any).navigator.geolocation = mockGeolocation;

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
