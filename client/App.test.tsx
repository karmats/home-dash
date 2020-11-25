import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const mockGeolocation = {
  getCurrentPosition: jest.fn(),
};
class EventSourceMock {
  close() {}
}
(global as any).navigator.geolocation = mockGeolocation;
(global as any).EventSource = EventSourceMock;

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
