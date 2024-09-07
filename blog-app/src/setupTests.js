// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Import additional testing libraries
import '@testing-library/react';
import '@testing-library/user-event';

// Set up any global test configurations
import { configure } from '@testing-library/react';

// Configure testing-library
configure({ testIdAttribute: 'data-testid' });

// Mock fetch API for testing
global.fetch = jest.fn();

// Reset mocks after each test
afterEach(() => {
  jest.resetAllMocks();
});
