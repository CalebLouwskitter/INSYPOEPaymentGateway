import { Navigate } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext.jsx';
import PropTypes from 'prop-types';

// References:
// React Router Team. (2025) Navigate - React Router. Available at: https://reactrouter.com/en/main/components/navigate (Accessed: 03 November 2025).

/**
 * Protected route component for employee portal
 * Redirects to login if not authenticated
 * Optionally restricts access by role
 */
export default function EmployeeProtectedRoute({ children, requireAdmin = false }) {
  const { isEmployeeAuthenticated, isAdmin } = useEmployeeAuth();

  // Not authenticated - redirect to employee login
  if (!isEmployeeAuthenticated) {
    return <Navigate to="/employee/login" replace />;
  }

  // Authenticated but requires admin role and user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  // Authenticated and authorized
  return children;
}

EmployeeProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
};

EmployeeProtectedRoute.defaultProps = {
  requireAdmin: false,
};
