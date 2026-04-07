import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AdminRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default AdminRoute;
