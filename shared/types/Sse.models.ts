export type SseData<T> = {
  result?: T;
  error?: unknown;
  heartbeat?: number;
};
