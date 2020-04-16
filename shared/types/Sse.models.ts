export type SseData<T> = {
  result?: T;
  error?: any;
  heartbeat?: number;
};
