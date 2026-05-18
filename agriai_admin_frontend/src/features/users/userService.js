import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';

export const userService = {
  getUsers: (params) => api.get(ENDPOINTS.ADMIN_USERS, { params }),

  getUserById: (id) => api.get(ENDPOINTS.ADMIN_USER_BY_ID(id)),

  createUser: (data) => api.post(ENDPOINTS.ADMIN_USERS, data),

  updateUser: (id, data) => api.put(ENDPOINTS.ADMIN_USER_BY_ID(id), data),

  softDeleteUser: (id) => api.patch(ENDPOINTS.ADMIN_USER_DELETE(id)),
};
