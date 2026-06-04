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
  ADMIN_CROP_TYPES: '/api/admin/crop-types',
  ADMIN_CROP_TYPES_STATS: '/api/admin/crop-types/stats',

  // Treatment Plan endpoints
  ADMIN_TREATMENT_PLANS: '/api/admin/treatment-plans',
  ADMIN_TREATMENT_PLAN_STATS: '/api/admin/treatment-plans/stats',
  ADMIN_TREATMENT_PLAN_BY_ID: (id) => `/api/admin/treatment-plans/${id}`,
  ADMIN_TREATMENT_PLAN_DELETE: (id) => `/api/admin/treatment-plans/${id}/delete`,
  ADMIN_TREATMENT_PLAN_DISEASES_SIMPLE: '/api/admin/treatment-plans/diseases/simple',
  ADMIN_TREATMENT_PLAN_DRUGS_SIMPLE: '/api/admin/treatment-plans/drugs/simple',

  // Drug endpoints
  ADMIN_DRUGS: '/api/admin/drugs',
  ADMIN_DRUG_STATS: '/api/admin/drugs/stats',
  ADMIN_DRUG_BY_ID: (id) => `/api/admin/drugs/${id}`,
  ADMIN_DRUG_DELETE: (id) => `/api/admin/drugs/${id}/delete`,
  ADMIN_DRUG_INGREDIENTS_SIMPLE: '/api/admin/drugs/ingredients/simple',
};

