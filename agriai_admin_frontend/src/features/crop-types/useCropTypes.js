import { useState, useCallback, useEffect } from 'react';
import cropTypeService from './cropTypeService';

export const useCropTypes = () => {
  const [cropTypes, setCropTypes] = useState([]);
  const [stats, setStats] = useState({
    totalCropTypes: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    cropName: ''
  });

  const fetchCropTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size,
        ...(filters.cropName && { cropName: filters.cropName })
      };
      
      const response = await cropTypeService.getCropTypes(params);
      setCropTypes(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách loại cây trồng');
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await cropTypeService.getCropTypeStats();
      setStats(response);
    } catch (err) {
      console.error('Lỗi khi tải thống kê loại cây trồng', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCropTypes();
    fetchStats();
  }, [fetchCropTypes, fetchStats]);

  return {
    cropTypes,
    stats,
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
    refreshCropTypes: fetchCropTypes,
    refreshStats: fetchStats
  };
};
