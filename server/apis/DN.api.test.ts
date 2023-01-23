import Parser from 'rss-parser';
import { vi } from 'vitest';
import * as api from './DN.api';
import { generateParsedDnRss } from './test/test.data';
vi.mock('../logger', () => ({ getLogger: vi.fn(() => ({ error: vi.fn() })) }));

let mockParseURL = Promise.resolve(generateParsedDnRss());
vi.mock('rss-parser', () => ({ default: vi.fn().mockImplementation(() => ({ parseURL: vi.fn(() => mockParseURL) })) }));

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
