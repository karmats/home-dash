import { useState } from 'react';
import useEventSource, { EventSourceConfig } from './useEventSource';

function useEventSourceWithRefresh<T, P extends Array<unknown> = [], R = T>(
  initialValue: T,
  eventSourceConfig: EventSourceConfig<T, R>,
  asyncFn: (...params: P) => Promise<R>,
  ...params: P
): {
  data: T;
  refreshData: () => void;
  updateData: (newValue: T) => void;
} {
  const { value, updateValue } = useEventSource<T, R>(initialValue, eventSourceConfig);
  const [refresh, setRefresh] = useState<boolean>(false);
  const { mappingFn } = eventSourceConfig;

  const refreshData = () => {
    if (!refresh) {
      setRefresh(true);
      asyncFn(...params).then(result => {
        setRefresh(false);
        updateValue(mappingFn ? mappingFn(result) : ((result as unknown) as T));
      });
    }
  };

  return { data: value, refreshData, updateData: updateValue };
}

export default useEventSourceWithRefresh;
