import { useState, useCallback, useEffect } from 'react';
import ingredientService from './ingredientService';

export const useIngredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [stats, setStats] = useState({ totalIngredients: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({ name: '' });

  const fetchIngredients = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size,
        ...(filters.name && { name: filters.name }),
      };
      const response = await ingredientService.getIngredients(params);
      setIngredients(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách hoạt chất');
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const fetchStats = useCallback(async () => {
    await Promise.resolve();
    try {
      const response = await ingredientService.getIngredientStats();
      setStats(response);
    } catch (err) {
      console.error('Lỗi khi tải thống kê hoạt chất', err);
    }
  }, []);

  const createIngredient = async (data) => {
    setLoading(true);
    try {
      await ingredientService.createIngredient(data);
      await fetchIngredients();
      await fetchStats();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo hoạt chất');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateIngredient = async (id, data) => {
    setLoading(true);
    try {
      await ingredientService.updateIngredient(id, data);
      await fetchIngredients();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật hoạt chất');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteIngredient = async (id) => {
    setLoading(true);
    try {
      await ingredientService.deleteIngredient(id);
      await fetchIngredients();
      await fetchStats();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa hoạt chất');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchStats();
  }, [fetchIngredients, fetchStats]);

  return {
    ingredients, stats, loading, error,
    page, size, totalPages, totalElements, filters,
    setPage, setSize, setFilters,
    createIngredient, updateIngredient, deleteIngredient,
    refreshIngredients: fetchIngredients,
  };
};
