import useEventSource, { EventSourceConfig } from './useEventSource';
import useRefresh from './useRefresh';

function useEventSourceWithRefresh<T, P extends Array<unknown> = [], R = T>(
  initialValue: T,
  eventSourceConfig: EventSourceConfig<T, R>,
  asyncFn: (...params: P) => Promise<R>,
  ...params: P
) {
  const { value, updateValue } = useEventSource<T, R>(initialValue, eventSourceConfig);
  const refreshValue = useRefresh<T, P, R>(asyncFn, ...params);
  const { mappingFn } = eventSourceConfig;

  const refreshData = () => {
    refreshValue().then(data => {
      updateValue(mappingFn ? mappingFn(data) : ((data as unknown) as T));
    });
  };
  return { data: value, refreshData, updateData: updateValue };
}

export default useEventSourceWithRefresh;
