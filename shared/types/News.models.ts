export interface News {
  source: string;
  url: string;
  image: string;
  language: string;
  items: NewsItem[];
}

export interface NewsItem {
  title: string;
  content?: string;
  link: string;
  date: string;
  media?: NewsMedia;
}

export interface NewsMedia {
  type: string;
  url: string;
  description: string;
}
