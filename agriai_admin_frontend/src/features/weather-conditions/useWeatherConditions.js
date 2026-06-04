import { useState, useCallback, useEffect } from 'react';
import weatherConditionService from './weatherConditionService';

export const useWeatherConditions = () => {
  const [conditions, setConditions] = useState([]);
  const [stats, setStats] = useState({ totalConditions: 0, activeConditions: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({ diseaseId: '' });

  const fetchConditions = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size,
        ...(filters.diseaseId && { diseaseId: filters.diseaseId }),
      };
      const response = await weatherConditionService.getConditions(params);
      setConditions(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách điều kiện thời tiết');
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const fetchStats = useCallback(async () => {
    await Promise.resolve();
    try {
      const response = await weatherConditionService.getConditionStats();
      setStats(response);
    } catch (err) {
      console.error('Lỗi khi tải thống kê điều kiện thời tiết', err);
    }
  }, []);

  const createCondition = async (data) => {
    setLoading(true);
    try {
      await weatherConditionService.createCondition(data);
      await fetchConditions();
      await fetchStats();
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCondition = async (id, data) => {
    setLoading(true);
    try {
      await weatherConditionService.updateCondition(id, data);
      await fetchConditions();
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCondition = async (id) => {
    setLoading(true);
    try {
      await weatherConditionService.deleteCondition(id);
      await fetchConditions();
      await fetchStats();
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
    fetchStats();
  }, [fetchConditions, fetchStats]);

  return {
    conditions, stats, loading, error,
    page, size, totalPages, totalElements, filters,
    setPage, setSize, setFilters,
    createCondition, updateCondition, deleteCondition,
    refreshConditions: fetchConditions,
  };
};
