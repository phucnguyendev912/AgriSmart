import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';

const treatmentPlanService = {
  getTreatmentPlans: async (params) => {
    const response = await api.get(ENDPOINTS.ADMIN_TREATMENT_PLANS, { params });
    return response.data;
  },

  getTreatmentPlanById: async (id) => {
    const response = await api.get(ENDPOINTS.ADMIN_TREATMENT_PLAN_BY_ID(id));
    return response.data;
  },

  createTreatmentPlan: async (data) => {
    const response = await api.post(ENDPOINTS.ADMIN_TREATMENT_PLANS, data);
    return response.data;
  },

  updateTreatmentPlan: async (id, data) => {
    const response = await api.put(ENDPOINTS.ADMIN_TREATMENT_PLAN_BY_ID(id), data);
    return response.data;
  },

  deleteTreatmentPlan: async (id) => {
    const response = await api.patch(ENDPOINTS.ADMIN_TREATMENT_PLAN_DELETE(id));
    return response.data;
  },

  getTreatmentPlanStats: async () => {
    const response = await api.get(ENDPOINTS.ADMIN_TREATMENT_PLAN_STATS);
    return response.data;
  },

  getSimpleDiseases: async () => {
    const response = await api.get(ENDPOINTS.ADMIN_TREATMENT_PLAN_DISEASES_SIMPLE);
    return response.data;
  },

  getSimpleDrugs: async () => {
    const response = await api.get(ENDPOINTS.ADMIN_TREATMENT_PLAN_DRUGS_SIMPLE);
    return response.data;
  },

  getSimpleCropTypes: async () => {
    const response = await api.get(ENDPOINTS.ADMIN_CROP_TYPES_SIMPLE);
    return response.data;
  }
};

export default treatmentPlanService;
