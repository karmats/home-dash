import { useState } from 'react';

function useRefresh<T, P extends Array<unknown> = []>(asyncFn: (...params: P) => Promise<T>, ...params: P) {
  const [refresh, setRefresh] = useState<boolean>(false);

  const refreshData = () => {
    if (!refresh) {
      setRefresh(true);
      return asyncFn(...params).then(result => {
        setRefresh(false);
        return result;
      });
    } else {
      return Promise.reject('Refresh already in progress');
    }
  };

  return refreshData;
}

export default useRefresh;
