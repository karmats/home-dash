import React from 'react';
import Spinner from '../../components/Spinner/Spinner';
import { News } from '../../../shared/types';
import api from '../../apis/Api';
import { useEventSourceWithRefresh } from '../../hooks';
import './News.css';

const newsEventSourceConfig = {
  eventSource: api.getLatestNewsEventSource(),
};
export default function () {
  const { data: news, refreshData: refreshNews } = useEventSourceWithRefresh<News>(
    { image: '', source: '', items: [], language: '', url: '' },
    newsEventSourceConfig,
    api.getLatestNews
  );

  return news && news.items.length ? (
    <ul className="News-main" onClick={refreshNews}>
      {news.items.map(n => (
        <li key={n.date}>{n.title}</li>
      ))}
    </ul>
  ) : (
    <Spinner />
  );
}
