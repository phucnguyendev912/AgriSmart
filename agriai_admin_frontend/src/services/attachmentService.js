import api from './api';
import { ENDPOINTS } from './endpoints';

export const getAttachments = async (params) => {
  const response = await api.get(ENDPOINTS.ADMIN_ATTACHMENTS, { params });
  return response.data;
};

export const deleteAttachment = async (id) => {
  const response = await api.delete(ENDPOINTS.ADMIN_ATTACHMENT_DELETE(id));
  return response.data;
};

export const restoreAttachment = async (id) => {
  const response = await api.post(ENDPOINTS.ADMIN_ATTACHMENT_RESTORE(id));
  return response.data;
};

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
