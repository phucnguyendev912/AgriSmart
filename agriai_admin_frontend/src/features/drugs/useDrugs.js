import { useState, useCallback, useEffect } from 'react';
import drugService from './drugService';

export const useDrugs = () => {
  const [drugs, setDrugs] = useState([]);
  const [stats, setStats] = useState({
    totalDrugs: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auxiliary list of active ingredients
  const [simpleIngredients, setSimpleIngredients] = useState([]);

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    drugName: '',
    manufacturer: '',
    isActive: '' // '' | 'true' | 'false'
  });

  const fetchDrugs = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size,
        ...(filters.drugName && { drugName: filters.drugName }),
        ...(filters.manufacturer && { manufacturer: filters.manufacturer }),
        ...(filters.isActive !== '' && { isActive: filters.isActive === 'true' })
      };

      const response = await drugService.getDrugs(params);
      setDrugs(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const fetchStats = useCallback(async () => {
    await Promise.resolve();
    try {
      const response = await drugService.getDrugStats();
      setStats(response);
    } catch (err) {
      console.error('Lỗi khi tải thống kê thuốc', err);
    }
  }, []);

  const fetchSelectData = useCallback(async () => {
    await Promise.resolve();
    try {
      const ingredients = await drugService.getSimpleIngredients();
      setSimpleIngredients(ingredients);
    } catch (err) {
      console.error('Lỗi khi tải danh mục hoạt chất', err);
    }
  }, []);

  // CRUD Actions
  const createDrug = async (data) => {
    setLoading(true);
    try {
      await drugService.createDrug(data);
      await fetchDrugs();
      await fetchStats();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo mới thuốc');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDrug = async (id, data) => {
    setLoading(true);
    try {
      await drugService.updateDrug(id, data);
      await fetchDrugs();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật thuốc');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDrug = async (id) => {
    setLoading(true);
    try {
      await drugService.deleteDrug(id);
      await fetchDrugs();
      await fetchStats();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa thuốc');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDrugs();
    fetchStats();
  }, [fetchDrugs, fetchStats]);

  // Load active ingredients on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSelectData();
  }, [fetchSelectData]);

  return {
    drugs,
    stats,
    loading,
    error,
    page,
    size,
    totalPages,
    totalElements,
    filters,
    simpleIngredients,
    setPage,
    setSize,
    setFilters,
    createDrug,
    updateDrug,
    deleteDrug,
    refreshDrugs: fetchDrugs,
    refreshStats: fetchStats
  };
};
