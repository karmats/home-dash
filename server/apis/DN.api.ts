import Parser, { Item } from 'rss-parser';
import { News, NewsItem } from '../../shared/types';
import { getLogger } from '../logger';

const BASE_URL = 'https://www.dn.se';

const logger = getLogger('DNApi');

const rssItemToNewsItem = (item: Item & { 'media:content': any }): NewsItem => ({
  content: item.content,
  date: item.isoDate!,
  link: item.link!,
  title: item.title!,
  media: item['media:content']
    ? {
        type: item['media:content'].$.type as string,
        url: item['media:content'].$.url as string,
        description: item['media:content']['media:description'][0] as string,
      }
    : undefined,
});

export const getLatestNews = (): Promise<News> =>
  new Parser<{ language: string }, { 'media:content': any }>({
    customFields: {
      item: [['media:content', 'media:content']],
    },
  })
    .parseURL(`${BASE_URL}/rss`)
    .then(feed => ({
      source: feed.image!.title!,
      image: feed.image!.url,
      language: feed.language,
      url: feed.link!,
      items: feed.items.map(rssItemToNewsItem),
    }))
    .catch(e => {
      const errorMsg = e ? JSON.stringify(e) : '';
      logger.error(`Failed to fetch latest news: '${errorMsg}'`);
      throw e;
    });
