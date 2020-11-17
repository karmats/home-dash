import { useState } from 'react';

function useRefresh<T, P extends Array<unknown> = [], R = T>(asyncFn: (...params: P) => Promise<R>, ...params: P) {
  const [refresh, setRefresh] = useState<boolean>(false);

  const refreshData = async () => {
    if (!refresh) {
      setRefresh(true);
      const result = await asyncFn(...params);
      setRefresh(false);
      return result;
    } else {
      return Promise.reject('Refresh already in progress');
    }
  };

  return refreshData;
}

export default useRefresh;
