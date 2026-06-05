import axios from 'axios';

const api = axios.create({
  baseURL: "",
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Gửi HttpOnly cookie theo mỗi request
});

// Xử lý lỗi 401 → về trang login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
