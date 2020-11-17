import { useEffect, useState } from 'react';
import { SseData } from '../../shared/types';

export type EventSourceConfig<T, R = T> = {
  eventSource: EventSource;
  mappingFn?: (result: R) => T;
};

function useEventSource<T, R = T>(initialValue: T, config: EventSourceConfig<T, R>) {
  const [value, setValue] = useState<T>(initialValue);
  useEffect(() => {
    const { eventSource, mappingFn } = config;
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
  const updateValue = (newValue: T) => {
    setValue(newValue);
  };

  return { value, updateValue };
}

export default useEventSource;
