import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';

const weatherConditionService = {
  getConditions: async (params) => {
    const response = await api.get(ENDPOINTS.ADMIN_WEATHER_CONDITIONS, { params });
    return response.data;
  },

  getConditionById: async (id) => {
    const response = await api.get(ENDPOINTS.ADMIN_WEATHER_CONDITION_BY_ID(id));
    return response.data;
  },

  createCondition: async (data) => {
    const response = await api.post(ENDPOINTS.ADMIN_WEATHER_CONDITIONS, data);
    return response.data;
  },

  updateCondition: async (id, data) => {
    const response = await api.put(ENDPOINTS.ADMIN_WEATHER_CONDITION_BY_ID(id), data);
    return response.data;
  },

  deleteCondition: async (id) => {
    const response = await api.patch(ENDPOINTS.ADMIN_WEATHER_CONDITION_DELETE(id));
    return response.data;
  },

  getConditionStats: async () => {
    const response = await api.get(ENDPOINTS.ADMIN_WEATHER_CONDITION_STATS);
    return response.data;
  },
};

export default weatherConditionService;
