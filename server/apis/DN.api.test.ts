import * as api from './DN.api';
import Parser from 'rss-parser';
import { generateParsedDnRss } from './test/test.data';
jest.mock('../logger', () => ({ getLogger: jest.fn(() => ({ error: jest.fn() })) }));

let mockParseURL = Promise.resolve(generateParsedDnRss());
jest.mock('rss-parser', () => jest.fn().mockImplementation(() => ({ parseURL: jest.fn(() => mockParseURL) })));

describe('DNApi', () => {
  it('fetches rss and converts to news', async () => {
    const news = await api.getLatestNews();

    expect(Parser).toHaveBeenCalled();
    expect(news).toBeDefined();
    expect(news.language).toBe('sv-se');
    expect(news.source).toBe('Dagens Nyheter');
    expect(news.items).toBeDefined();
    expect(news.items.length).toBe(7);
    expect(news.items[0].title).toBe('Elin Willows tonträff är mycket exakt');
    expect(news.items[0].media).toBeDefined();
    expect(news.items[4].media).not.toBeDefined();
  });

  it('throws error if something goes wrong', async () => {
    mockParseURL = Promise.reject(new Error('General error'));

    try {
      await api.getLatestNews();
      fail('Expect error to be thrown');
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
