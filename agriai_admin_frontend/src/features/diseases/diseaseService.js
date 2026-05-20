import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';

const diseaseService = {
  getDiseases: async (params) => {
    const response = await api.get(ENDPOINTS.ADMIN_DISEASES, { params });
    return response.data; // Note: We removed ApiResponse wrapper in BE for Diseases
  },

  getDiseaseStats: async () => {
    const response = await api.get(ENDPOINTS.ADMIN_DISEASE_STATS);
    return response.data;
  },

  getDiseaseById: async (id) => {
    const response = await api.get(ENDPOINTS.ADMIN_DISEASE_BY_ID(id));
    return response.data;
  },

  createDisease: async (diseaseData) => {
    const response = await api.post(ENDPOINTS.ADMIN_DISEASES, diseaseData);
    return response.data;
  },

  updateDisease: async (id, diseaseData) => {
    const response = await api.put(ENDPOINTS.ADMIN_DISEASE_BY_ID(id), diseaseData);
    return response.data;
  },

  deleteDisease: async (id) => {
    const response = await api.patch(ENDPOINTS.ADMIN_DISEASE_DELETE(id));
    return response.data;
  },

  getSimpleCropTypes: async () => {
    const response = await api.get(ENDPOINTS.ADMIN_CROP_TYPES_SIMPLE);
    return response.data;
  }
};

export default diseaseService;
