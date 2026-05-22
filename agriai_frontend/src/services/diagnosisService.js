import api from './api';

/**
 * Fetches all available crop types.
 */
export const getCropTypes = async () => {
  const response = await api.get('/api/crop-types');
  return response;
};

/**
 * Submits diagnostic request with plant leaf image and context.
 */
export const submitDiagnosis = async (formData) => {
  const response = await api.post('/api/diagnosis', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

/**
 * Fetches user diagnostic history.
 */
export const getHistory = async (params) => {
  const response = await api.get('/api/diagnosis/history', { params });
  return response;
};

/**
 * Fetches diagnosis detail by ID.
 */
export const getDiagnosisDetail = async (id) => {
  const response = await api.get(`/api/diagnosis/${id}`);
  return response;
};

/**
 * Fetches rating review for a specific diagnosis history item.
 */
export const getReview = async (historyId) => {
  const response = await api.get(`/api/reviews/${historyId}`);
  return response;
};

/**
 * Submits user review/feedback for a diagnosis.
 */
export const submitReview = async (reviewData) => {
  const response = await api.post('/api/reviews', reviewData);
  return response;
};

/**
 * Fetches all user feedback reviews (admin view).
 */
export const getAllReviews = async () => {
  const response = await api.get('/api/reviews/all');
  return response;
};
