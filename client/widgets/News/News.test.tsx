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

jest.useFakeTimers();

describe('News', () => {
  describe('Component', () => {
    afterEach(cleanup);
    it('renders', () => {
      render(<NewsComponent />);
    });

    it('renders indication that news are fetching', () => {
      const { getByText } = render(<NewsComponent />);
      const indicator = getByText('Loading...');
      expect(indicator).toBeDefined();
    });

    it('renders title, image and description', () => {
      const newsData: News = {
        image: '',
        language: 'sv',
        source: 'https://dn.se',
        url: 'https://dn.se',
        items: [
          {
            date: new Date().toISOString(),
            link: 'https://dn.se',
            title: 'Something bad happened',
            content: 'Yes its true something bad has happened',
            media: {
              description: 'Look at this image',
              type: 'image/jpg',
              url: 'https://dn.se',
            },
          },
        ],
      };
      mockUseEventSourceWithRefresh = {
        data: newsData,
        refreshData: () => {},
        updateData: () => {},
      };

      const { getByText, getByAltText } = render(<NewsComponent />);

      const firstNewsData = newsData.items[0];
      expect(getByText(firstNewsData.title)).toBeDefined();
      expect(getByText(firstNewsData.content!)).toBeDefined();
      expect(getByAltText(firstNewsData.media!.description)).toBeDefined();
    });
  });
});
