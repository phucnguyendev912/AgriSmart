import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';

const drugInteractionService = {
  getInteractions: async (params) => {
    const response = await api.get(ENDPOINTS.ADMIN_DRUG_INTERACTIONS, { params });
    return response.data;
  },

  getInteractionById: async (id) => {
    const response = await api.get(ENDPOINTS.ADMIN_DRUG_INTERACTION_BY_ID(id));
    return response.data;
  },

  createInteraction: async (data) => {
    const response = await api.post(ENDPOINTS.ADMIN_DRUG_INTERACTIONS, data);
    return response.data;
  },

  updateInteraction: async (id, data) => {
    const response = await api.put(ENDPOINTS.ADMIN_DRUG_INTERACTION_BY_ID(id), data);
    return response.data;
  },

  deleteInteraction: async (id) => {
    const response = await api.patch(ENDPOINTS.ADMIN_DRUG_INTERACTION_DELETE(id));
    return response.data;
  },

  getInteractionStats: async () => {
    const response = await api.get(ENDPOINTS.ADMIN_DRUG_INTERACTION_STATS);
    return response.data;
  },
};

export default drugInteractionService;
