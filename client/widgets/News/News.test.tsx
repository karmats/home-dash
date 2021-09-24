import 'jest';
import React from 'react';
import { cleanup, render } from '@testing-library/react';
import NewsComponent from './News';
import { News } from '../../../shared/types';

// Mocks
jest.mock('../../apis/Api', () => ({
  __esModule: true,
  default: {
    getLatestNews: jest.fn(() => Promise.resolve()),
    getLatestNewsEventSource: jest.fn(),
  },
}));
let mockUseEventSourceWithRefresh = {
  data: { image: '', items: [], language: '', source: '', url: '' } as News,
  refreshData: () => {},
  updateData: () => {},
};
jest.mock('../../hooks', () => ({
  useEventSourceWithRefresh: () => mockUseEventSourceWithRefresh,
}));

describe('News', () => {
  describe('Component', () => {
    afterEach(cleanup);
    it('renders', () => {
      render(<NewsComponent />);
    });
  });
});
