import { useNavigate, useLocation } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext.jsx';

// References:
// React Router Team. (2025) useNavigate - React Router. Available at: https://reactrouter.com/en/main/hooks/use-navigate (Accessed: 03 November 2025).

/**
 * Navigation component for employee portal
 * Shows different menu items based on user role
 */
export default function EmployeeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeUser, isAdmin, employeeLogout } = useEmployeeAuth();

  const handleLogout = async () => {
    await employeeLogout();
    navigate('/employee/login', { replace: true });
  };

  const navStyle = {
    backgroundColor: '#1F2937',
    color: 'white',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const brandStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#8B5CF6',
  };

  const menuStyle = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  };

  const linkStyle = (isActive) => ({
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    backgroundColor: isActive ? '#374151' : 'transparent',
    transition: 'background-color 0.3s',
    textDecoration: 'none',
    color: 'white',
  });

  const buttonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    backgroundColor: '#EF4444',
    border: 'none',
    color: 'white',
    fontWeight: '500',
    transition: 'background-color 0.3s',
  };

  const userInfoStyle = {
    fontSize: '0.9rem',
    color: '#D1D5DB',
    marginRight: '1rem',
  };

  const roleBadgeStyle = {
    backgroundColor: isAdmin ? '#8B5CF6' : '#10B981',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginLeft: '0.5rem',
  };

  return (
    <nav style={navStyle}>
      <div style={brandStyle}>
        🏦 Payment Gateway - Employee Portal
      </div>
      
      <div style={menuStyle}>
        {/* Employee menu items */}
        {!isAdmin && (
          <>
            <div
              style={linkStyle(location.pathname === '/employee/dashboard')}
              onClick={() => navigate('/employee/dashboard')}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => {
                if (location.pathname !== '/employee/dashboard') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              Pending Payments
            </div>
            <div
              style={linkStyle(location.pathname === '/employee/history')}
              onClick={() => navigate('/employee/history')}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => {
                if (location.pathname !== '/employee/history') {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              Payment History
            </div>
          </>
        )}

        {/* Admin menu items */}
        {isAdmin && (
          <div
            style={linkStyle(location.pathname === '/employee/admin')}
            onClick={() => navigate('/employee/admin')}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
            onMouseLeave={(e) => {
              if (location.pathname !== '/employee/admin') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            Manage Employees
          </div>
        )}

        {/* User info and logout */}
        <div style={userInfoStyle}>
          {employeeUser?.username}
          <span style={roleBadgeStyle}>
            {isAdmin ? 'ADMIN' : 'EMPLOYEE'}
          </span>
        </div>
        
        <button
          style={buttonStyle}
          onClick={handleLogout}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#DC2626'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#EF4444'}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
