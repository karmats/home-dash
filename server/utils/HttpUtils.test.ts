import 'jest';
import { errorToSseData, heartbeatData, resultToSseData } from './HttpUtils';

describe('HttpUtils', () => {
  describe('resultToSSeData', () => {
    it('converts result to SseData string', () => {
      const someResult = { numParam: 1, stringParam: 'string' };
      expect(resultToSseData(someResult)).toBe('data:{"result":{"numParam":1,"stringParam":"string"}}\n\n');
    });
    it('converts error to SseData', () => {
      const error = new Error('Some error');
      expect(errorToSseData(error)).toBe('data:{"errorResult":{"name":"Error","message":"Some error"}}\n\n');
    });
    it('creates heartbeat data', () => {
      const time = 123456;
      expect(heartbeatData(time)).toBe('data:{"heartbeat":123456}\n\n');
    });
  });
});
