import api from './api';

export const getCropTypes = async () => {
  const response = await api.get('/api/crop-types');
  return response;
};

export const submitDiagnosis = async (formData) => {
  const response = await api.post('/api/diagnosis', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

export const getHistory = async (params) => {
  const response = await api.get('/api/diagnosis/history', { params });
  return response;
};

export const getDiagnosisDetail = async (id) => {
  const response = await api.get(`/api/diagnosis/${id}`);
  return response;
};

export const getReview = async (historyId) => {
  const response = await api.get(`/api/reviews/${historyId}`);
  return response;
};

export const submitReview = async (reviewData) => {
  const response = await api.post('/api/reviews', reviewData);
  return response;
};

export const getAllReviews = async () => {
  const response = await api.get('/api/reviews/all');
  return response;
};
