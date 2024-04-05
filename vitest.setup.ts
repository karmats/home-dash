import '@testing-library/jest-dom/vitest';

class EventSourceMock {
  close() {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).EventSource = EventSourceMock;
