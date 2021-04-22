//  import React from 'react';
//  import { render } from '@testing-library/react';
//  import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

test('renders without crashing', () => {
  //  const { getByText } = render(<App />);
  //  const linkElement = getByText(/learn react/i);
  //  expect(linkElement).toBeInTheDocument();
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});
