class EventSourceMock {
  close() {}
}
(global as any).EventSource = EventSourceMock;

export {};
