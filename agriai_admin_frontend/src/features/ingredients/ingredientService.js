import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';

const ingredientService = {
  getIngredients: async (params) => {
    const response = await api.get(ENDPOINTS.ADMIN_INGREDIENTS, { params });
    return response.data;
  },

  getIngredientById: async (id) => {
    const response = await api.get(ENDPOINTS.ADMIN_INGREDIENT_BY_ID(id));
    return response.data;
  },

  createIngredient: async (data) => {
    const response = await api.post(ENDPOINTS.ADMIN_INGREDIENTS, data);
    return response.data;
  },

  updateIngredient: async (id, data) => {
    const response = await api.put(ENDPOINTS.ADMIN_INGREDIENT_BY_ID(id), data);
    return response.data;
  },

  deleteIngredient: async (id) => {
    const response = await api.patch(ENDPOINTS.ADMIN_INGREDIENT_DELETE(id));
    return response.data;
  },

  getIngredientStats: async () => {
    const response = await api.get(ENDPOINTS.ADMIN_INGREDIENT_STATS);
    return response.data;
  },
};

export default ingredientService;
