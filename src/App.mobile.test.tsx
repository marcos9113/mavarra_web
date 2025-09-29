import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import App from './App';

it('toggles mobile navigation visibility when the menu button is pressed', () => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
  const { getByLabelText, getByTestId } = render(<App />);
  const button = getByLabelText(/open navigation menu/i);
  fireEvent.click(button);
  const menu = getByTestId('mobile-nav-panel');
  expect(menu).toHaveAttribute('aria-hidden', 'false');
  expect(button).toHaveAttribute('aria-expanded', 'true');

  fireEvent.click(button);
  expect(menu).toHaveAttribute('aria-hidden', 'true');
  expect(button).toHaveAttribute('aria-expanded', 'false');

  Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
});
