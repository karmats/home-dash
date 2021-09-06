import express from 'express';
import NewsService from './News.service';
import { DEFAULT_HEADERS, SSE_HEADERS } from '../../utils';
import { News } from '../../../shared/types';
import { PollHandler } from '../../services';
import { ExpressRequest } from '../../models';

// Every 10 minutes
const NEWS_REFRESH_INTERVAL = 10 * 60 * 1000;

let pollHandler: PollHandler<News>;
const getLatestNews = (req: ExpressRequest<{ sse?: string }>, res: express.Response): void => {
  const { sse } = req.query;
  if (sse) {
    // Sse requested, keep connection open and feed with news data
    res.writeHead(200, SSE_HEADERS);

    if (!pollHandler) {
      const pollFn = () => NewsService.getLatestNews();
      pollHandler = new PollHandler(pollFn, NEWS_REFRESH_INTERVAL);
    }
    pollHandler.registerPollerService(res, req);

    req.on('close', () => pollHandler.unregisterPollerService(res, req));
  } else {
    NewsService.getLatestNews()
      .then(news => {
        if (pollHandler) {
          pollHandler.reportData(news);
        }
        res.writeHead(200, DEFAULT_HEADERS);
        res.write(JSON.stringify(news));
        res.end();
      })
      .catch(e => {
        res.writeHead(500, DEFAULT_HEADERS);
        res.write(JSON.stringify(e));
        res.end();
      });
  }
};

export default { getLatestNews };
