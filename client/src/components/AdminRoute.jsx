import { Navigate, useLocation } from 'react-router-dom';
import { getDefaultRouteForRole, getLoginRouteForRole } from '../services/authRoutes';
import { useAuthStore } from '../store/authStore';

const AdminRoute = ({ children, allowedRoles = [] }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const preferredRole = allowedRoles[0];

  if (!token || !user) {
    return (
      <Navigate
        to={getLoginRouteForRole(preferredRole)}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return children;
};

export default AdminRoute;
