import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stringify options to avoid infinite dependency loops in useEffect
  const serializedOptions = JSON.stringify(options);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsedOptions = serializedOptions ? JSON.parse(serializedOptions) : {};
      const response = await api.get(url, parsedOptions);
      setData(response.data);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, [url, serializedOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
