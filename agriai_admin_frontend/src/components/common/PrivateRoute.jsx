import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

// Bảo vệ route: chưa đăng nhập → redirect về /login
export default function PrivateRoute({ children }) {
  const { admin } = useAdminAuth();
  return admin ? children : <Navigate to="/login" replace />;
}
