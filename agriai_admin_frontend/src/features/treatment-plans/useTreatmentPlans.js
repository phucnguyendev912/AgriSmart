import { useState, useCallback, useEffect } from 'react';
import treatmentPlanService from './treatmentPlanService';

export const useTreatmentPlans = () => {
  const [treatmentPlans, setTreatmentPlans] = useState([]);
  const [stats, setStats] = useState({
    totalTreatmentPlans: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Auxiliary list data for selects
  const [simpleDiseases, setSimpleDiseases] = useState([]);
  const [simpleDrugs, setSimpleDrugs] = useState([]);
  const [simpleCropTypes, setSimpleCropTypes] = useState([]);

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    treatmentName: '',
    cropTypeId: ''
  });

  const fetchTreatmentPlans = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size,
        ...(filters.treatmentName && { treatmentName: filters.treatmentName }),
        ...(filters.cropTypeId && { cropTypeId: filters.cropTypeId })
      };
      
      const response = await treatmentPlanService.getTreatmentPlans(params);
      setTreatmentPlans(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách phác đồ điều trị');
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const fetchStats = useCallback(async () => {
    await Promise.resolve();
    try {
      const response = await treatmentPlanService.getTreatmentPlanStats();
      setStats(response);
    } catch (err) {
      console.error('Lỗi khi tải thống kê phác đồ điều trị', err);
    }
  }, []);

  const fetchSelectData = useCallback(async () => {
    await Promise.resolve();
    try {
      const [diseases, drugs, cropTypes] = await Promise.all([
        treatmentPlanService.getSimpleDiseases(),
        treatmentPlanService.getSimpleDrugs(),
        treatmentPlanService.getSimpleCropTypes()
      ]);
      setSimpleDiseases(diseases);
      setSimpleDrugs(drugs);
      setSimpleCropTypes(cropTypes);
    } catch (err) {
      console.error('Lỗi khi tải danh mục phác đồ điều trị', err);
    }
  }, []);

  // Actions
  const createTreatmentPlan = async (data) => {
    setLoading(true);
    try {
      await treatmentPlanService.createTreatmentPlan(data);
      await fetchTreatmentPlans();
      await fetchStats();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo mới phác đồ điều trị');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTreatmentPlan = async (id, data) => {
    setLoading(true);
    try {
      await treatmentPlanService.updateTreatmentPlan(id, data);
      await fetchTreatmentPlans();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật phác đồ điều trị');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTreatmentPlan = async (id) => {
    setLoading(true);
    try {
      await treatmentPlanService.deleteTreatmentPlan(id);
      await fetchTreatmentPlans();
      await fetchStats();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa phác đồ điều trị');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTreatmentPlans();
    fetchStats();
  }, [fetchTreatmentPlans, fetchStats]);

  // Load dropdown lists on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSelectData();
  }, [fetchSelectData]);

  return {
    treatmentPlans,
    stats,
    loading,
    error,
    page,
    size,
    totalPages,
    totalElements,
    filters,
    simpleDiseases,
    simpleDrugs,
    simpleCropTypes,
    setPage,
    setSize,
    setFilters,
    createTreatmentPlan,
    updateTreatmentPlan,
    deleteTreatmentPlan,
    refreshTreatmentPlans: fetchTreatmentPlans,
    refreshStats: fetchStats
  };
};
