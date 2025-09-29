import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders primary navigation call to action', () => {
  render(<App />);
  const ctaLink = screen.getByRole('link', { name: /get started/i });
  expect(ctaLink).toBeInTheDocument();
});
