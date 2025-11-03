import { Navigate } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext.jsx';

// References:
// React Router Team. (2025) Navigate - React Router. Available at: https://reactrouter.com/en/main/components/navigate (Accessed: 03 November 2025).

/**
 * Protected route component for employee portal
 * Redirects to login if not authenticated
 * Optionally restricts access by role
 */
export default function EmployeeProtectedRoute({ children, requireAdmin = false }) {
  const { isEmployeeAuthenticated, isAdmin, employeeUser } = useEmployeeAuth();

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
