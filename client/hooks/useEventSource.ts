import { useEffect, useState } from 'react';
import { SseData } from '../../shared/types';

export type EventSourceConfig<T, P extends Array<unknown> = [], R = T> = {
  apiCall: (...params: P) => EventSource;
  params: P;
  mappingFn?: (result: R) => T;
};

function useEventSource<T, P extends Array<unknown> = [], R = T>(initialValue: T, config: EventSourceConfig<T, P, R>) {
  const [value, setValue] = useState<T>(initialValue);
  useEffect(() => {
    const { apiCall, params, mappingFn } = config;
    const eventSource = apiCall(...params);
    if (eventSource) {
      eventSource.onmessage = e => {
        const { result, error }: SseData<R> = JSON.parse(e.data);
        if (result) {
          setValue(mappingFn ? mappingFn(result) : ((result as unknown) as T));
        } else if (error) {
          console.error(error);
        }
      };
    }
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [config]);

  return value;
}

export default useEventSource;
