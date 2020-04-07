export type Heartbeat = {
  time: number;
};

export type EventDataHandler<T> = {
  next: (value: { result?: T; heartbeat?: Heartbeat }) => void;
  error: (error: any) => void;
  complete?: () => void;
};

// Every 30 second
const HEARTBEAT_INTERVAL = 30 * 1000;

export class EventDataPollerService<R> {
  timer: any;
  constructor(
    private pollFn: () => Promise<R>,
    private handler: EventDataHandler<R>,
    interval: number,
    immediate = true
  ) {
    let timeElapsed = 0;
    this.timer = setInterval(() => {
      timeElapsed += HEARTBEAT_INTERVAL;
      if (timeElapsed > interval) {
        this._fetchData();
        timeElapsed = 0;
      } else {
        this.handler.next({ heartbeat: { time: Date.now() } });
      }
    }, HEARTBEAT_INTERVAL);
    if (immediate) {
      this._fetchData();
    }
  }
  finish() {
    clearInterval(this.timer);
    if (this.handler.complete) {
      this.handler.complete();
    }
  }

  private _fetchData() {
    this.pollFn().then(
      result => {
        this.handler.next({ result });
      },
      error => {
        this.handler.error(error);
      }
    );
  }
}
