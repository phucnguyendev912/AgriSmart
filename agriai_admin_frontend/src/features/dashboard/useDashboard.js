import { useState, useEffect } from 'react';
import { fetchDashboard } from './dashboardService';

export function useDashboard(periodDays = 30) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchDashboard(periodDays)
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || 'Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [periodDays]);

  return { data, loading, error, retry: load };
}
