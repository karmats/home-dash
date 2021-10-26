import React, { useEffect, useState } from 'react';
import Spinner from '../../components/Spinner/Spinner';
import { News } from '../../../shared/types';
import api from '../../apis/Api';
import { useEventSourceWithRefresh } from '../../hooks';
import './News.css';

// Every 10 second
const TIME_REFRESH_INTERVAL = 5 * 1000;

const newsEventSourceConfig = {
  eventSource: api.getLatestNewsEventSource(),
};
export default function () {
  const { data: news, refreshData: refreshNews } = useEventSourceWithRefresh<News>(
    { image: '', source: '', items: [], language: '', url: '' },
    newsEventSourceConfig,
    api.getLatestNews
  );
  const [currentNewsIdx, setCurrentNewsIdx] = useState<number>(0);
  useEffect(() => {
    const updateCurrentNews = () => setCurrentNewsIdx((currentNewsIdx + 1) % news.items.length);
    const timeInterval = setInterval(updateCurrentNews, TIME_REFRESH_INTERVAL);
    return () => {
      clearInterval(timeInterval);
    };
  }, [currentNewsIdx, news]);

  const currentNews = news.items[currentNewsIdx];
  const content = currentNews?.content || currentNews?.media?.description;
  return currentNews ? (
    <div className="News-main" onClick={refreshNews}>
      <h1 className="News-header">{currentNews.title}</h1>
      <div className="News-content">
        {currentNews.media ? (
          <img className="News-image" src={currentNews.media.url} alt={currentNews.media.description}></img>
        ) : null}
        {content ? <p className="News-description">{content}</p> : null}
      </div>
    </div>
  ) : (
    <Spinner />
  );
}
