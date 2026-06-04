import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';

const cropTypeService = {
  getCropTypes: async (params) => {
    const response = await api.get(ENDPOINTS.ADMIN_CROP_TYPES, { params });
    return response.data;
  },

  getCropTypeStats: async () => {
    const response = await api.get(ENDPOINTS.ADMIN_CROP_TYPES_STATS);
    return response.data;
  }
};

export default cropTypeService;
