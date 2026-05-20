import { useState, useCallback, useEffect } from 'react';
import diseaseService from './diseaseService';

export const useDiseases = () => {
  const [diseases, setDiseases] = useState([]);
  const [stats, setStats] = useState({
    totalDiseases: 0,
    totalCropTypes: 0,
  });
  const [cropTypes, setCropTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    cropTypeId: ''
  });

  const fetchDiseases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size,
        ...(filters.cropTypeId && { cropTypeId: filters.cropTypeId })
      };
      
      const response = await diseaseService.getDiseases(params);
      setDiseases(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách bệnh');
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await diseaseService.getDiseaseStats();
      setStats(response);
    } catch (err) {
      console.error('Lỗi khi tải thống kê', err);
    }
  }, []);

  const fetchCropTypes = useCallback(async () => {
    try {
      const response = await diseaseService.getSimpleCropTypes();
      setCropTypes(response);
    } catch (err) {
      console.error('Lỗi khi tải danh sách loại cây', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDiseases();
    fetchStats();
  }, [fetchDiseases, fetchStats]);

  useEffect(() => {
    fetchCropTypes();
  }, [fetchCropTypes]);

  const createDisease = async (diseaseData) => {
    setLoading(true);
    setError(null);
    try {
      await diseaseService.createDisease(diseaseData);
      await fetchDiseases();
      await fetchStats();
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi thêm bệnh';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateDisease = async (id, diseaseData) => {
    setLoading(true);
    setError(null);
    try {
      await diseaseService.updateDisease(id, diseaseData);
      await fetchDiseases();
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi cập nhật bệnh';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteDisease = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await diseaseService.deleteDisease(id);
      await fetchDiseases();
      await fetchStats();
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Lỗi khi xóa bệnh';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    diseases,
    stats,
    cropTypes,
    loading,
    error,
    page,
    size,
    totalPages,
    totalElements,
    filters,
    setPage,
    setSize,
    setFilters,
    createDisease,
    updateDisease,
    deleteDisease,
    refreshDiseases: fetchDiseases
  };
};
