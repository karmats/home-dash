export type Heartbeat = {
  time: number;
};

export type EventDataHandler<T> = {
  id?: string;
  data: (value: T) => void;
  heartbeat: (heartBeat: Heartbeat) => void;
  error: (error: any) => void;
  complete?: () => void;
};

// Send heartbeat every 30 second to keep the connection alive
const HEARTBEAT_INTERVAL = 30 * 1000;

export class EventDataPollerService<R> {
  timer: unknown;
  handlers: EventDataHandler<R>[] = [];
  lastResult?: R;
  constructor(private pollFn: () => Promise<R>, interval: number, wait = 0) {
    let timeElapsed = 0;
    this.timer = setInterval(() => {
      timeElapsed += HEARTBEAT_INTERVAL;
      if (timeElapsed > interval && this.handlers.length) {
        this._fetchData();
        timeElapsed = 0;
      } else {
        this.handlers.forEach(h => h.heartbeat({ time: Date.now() }));
      }
    }, HEARTBEAT_INTERVAL);
    if (wait > 0) {
      setTimeout(() => {
        this._fetchData();
      }, wait);
    } else {
      this._fetchData();
    }
  }
  registerHandler(handler: EventDataHandler<R>): void {
    this.handlers = this.handlers.concat(handler);
    if (this.lastResult) {
      handler.data(this.lastResult);
    }
  }
  reportData(data: R): void {
    this.handlers.forEach(h => h.data(data));
    this.lastResult = data;
  }
  finish(handlerId: string): void {
    const handler = this.handlers.find(h => h.id === handlerId);
    this.handlers = this.handlers.filter(h => h.id !== handlerId);
    if (handler && handler.complete) {
      handler.complete();
    }
  }

  private _fetchData(): void {
    this.pollFn().then(
      result => {
        this.handlers.forEach(h => h.data(result));
        this.lastResult = result;
      },
      error => {
        this.handlers.forEach(h => h.data(error));
      }
    );
  }
}
