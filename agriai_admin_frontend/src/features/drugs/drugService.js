import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';

const drugService = {
  getDrugs: async (params) => {
    const response = await api.get(ENDPOINTS.ADMIN_DRUGS, { params });
    return response.data;
  },

  getDrugById: async (id) => {
    const response = await api.get(ENDPOINTS.ADMIN_DRUG_BY_ID(id));
    return response.data;
  },

  createDrug: async (data) => {
    const response = await api.post(ENDPOINTS.ADMIN_DRUGS, data);
    return response.data;
  },

  updateDrug: async (id, data) => {
    const response = await api.put(ENDPOINTS.ADMIN_DRUG_BY_ID(id), data);
    return response.data;
  },

  deleteDrug: async (id) => {
    const response = await api.patch(ENDPOINTS.ADMIN_DRUG_DELETE(id));
    return response.data;
  },

  getDrugStats: async () => {
    const response = await api.get(ENDPOINTS.ADMIN_DRUG_STATS);
    return response.data;
  },

  getSimpleIngredients: async () => {
    const response = await api.get(ENDPOINTS.ADMIN_DRUG_INGREDIENTS_SIMPLE);
    return response.data;
  }
};

export default drugService;
