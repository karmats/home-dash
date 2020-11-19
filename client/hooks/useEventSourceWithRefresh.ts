import { useState } from 'react';
import useEventSource, { EventSourceConfig } from './useEventSource';

function useEventSourceWithRefresh<T, P extends Array<unknown> = [], R = T>(
  initialValue: T,
  eventSourceConfig: EventSourceConfig<T, R>,
  asyncFn: (...params: P) => Promise<R>,
  ...params: P
) {
  const { value, updateValue } = useEventSource<T, R>(initialValue, eventSourceConfig);
  const [refresh, setRefresh] = useState<boolean>(false);
  const { mappingFn } = eventSourceConfig;

  const refreshData = async () => {
    if (!refresh) {
      setRefresh(true);
      const result = await asyncFn(...params);
      setRefresh(false);
      updateValue(mappingFn ? mappingFn(result) : ((result as unknown) as T));
    }
  };

  return { data: value, refreshData, updateData: updateValue };
}

export default useEventSourceWithRefresh;
