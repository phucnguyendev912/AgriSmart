import api from './api';

export const uploadAttachment = async (file, category = '') => {
  const formData = new FormData();
  formData.append('file', file);
  if (category) {
    formData.append('category', category);
  }

  const response = await api.post('/api/attachments/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const deleteAttachment = async (id) => {
  const response = await api.delete(`/api/attachments/${id}`);
  return response;
};
