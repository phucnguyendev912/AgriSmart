import { useState, useCallback, useEffect } from 'react';
import drugInteractionService from './drugInteractionService';

export const useDrugInteractions = () => {
  const [interactions, setInteractions] = useState([]);
  const [stats, setStats] = useState({ totalInteractions: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({ query: '' });

  const fetchInteractions = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size,
        ...(filters.query && { query: filters.query }),
      };
      const response = await drugInteractionService.getInteractions(params);
      setInteractions(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách tương tác thuốc');
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const fetchStats = useCallback(async () => {
    await Promise.resolve();
    try {
      const response = await drugInteractionService.getInteractionStats();
      setStats(response);
    } catch (err) {
      console.error('Lỗi khi tải thống kê tương tác thuốc', err);
    }
  }, []);

  const createInteraction = async (data) => {
    setLoading(true);
    try {
      await drugInteractionService.createInteraction(data);
      await fetchInteractions();
      await fetchStats();
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInteraction = async (id, data) => {
    setLoading(true);
    try {
      await drugInteractionService.updateInteraction(id, data);
      await fetchInteractions();
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInteraction = async (id) => {
    setLoading(true);
    try {
      await drugInteractionService.deleteInteraction(id);
      await fetchInteractions();
      await fetchStats();
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInteractions();
    fetchStats();
  }, [fetchInteractions, fetchStats]);

  return {
    interactions, stats, loading, error,
    page, size, totalPages, totalElements, filters,
    setPage, setSize, setFilters,
    createInteraction, updateInteraction, deleteInteraction,
    refreshInteractions: fetchInteractions,
  };
};
