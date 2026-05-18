import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';

export const fetchDashboard = (periodDays = 30) =>
  api.get(ENDPOINTS.ADMIN_DASHBOARD, { params: { periodDays } }).then((res) => res.data);
