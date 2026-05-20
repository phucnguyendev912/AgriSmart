export const ENDPOINTS = {
  ADMIN_DASHBOARD: '/api/admin/dashboard',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_USER_BY_ID: (id) => `/api/admin/users/${id}`,
  ADMIN_USER_DELETE: (id) => `/api/admin/users/${id}/delete`,
  
  // Disease endpoints
  ADMIN_DISEASES: '/api/admin/diseases',
  ADMIN_DISEASE_STATS: '/api/admin/diseases/stats',
  ADMIN_DISEASE_BY_ID: (id) => `/api/admin/diseases/${id}`,
  ADMIN_DISEASE_DELETE: (id) => `/api/admin/diseases/${id}/delete`,
  
  // Crop Type endpoints
  ADMIN_CROP_TYPES_SIMPLE: '/api/admin/crop-types/simple',
};

