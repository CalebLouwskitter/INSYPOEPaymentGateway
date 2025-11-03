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
    // Glassmorphism nav: translucent gradient, blur and subtle border
    background: 'linear-gradient(135deg, rgba(76,81,191,0.65) 0%, rgba(118,75,162,0.55) 100%)',
    color: 'white',
    padding: '0.85rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '14px',
    margin: '0.5rem 1rem',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
  };

  const brandStyle = {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.95)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
  };

  const menuStyle = {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  };

  const linkStyle = (isActive) => ({
    padding: '0.5rem 1rem',
    borderRadius: '10px',
    cursor: 'pointer',
    backgroundColor: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
    border: isActive ? '1px solid rgba(255,255,255,0.28)' : '1px solid transparent',
    transition: 'all 0.25s ease',
    textDecoration: 'none',
    color: 'white',
    fontWeight: '600',
    fontSize: '0.95rem',
    backdropFilter: isActive ? 'blur(6px)' : 'none',
  });

  const buttonStyle = {
    padding: '0.5rem 1.1rem',
    borderRadius: '10px',
    cursor: 'pointer',
    backgroundColor: 'rgba(245,101,101,0.85)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: 'white',
    fontWeight: '700',
    transition: 'all 0.25s ease',
    fontSize: '0.95rem',
    boxShadow: '0 6px 16px rgba(245, 101, 101, 0.25)'
  };

  const userInfoStyle = {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.92)',
    marginRight: '1rem',
    fontWeight: '600',
  };

  const roleBadgeStyle = {
    backgroundColor: isAdmin ? 'rgba(128,90,213,0.85)' : 'rgba(72,187,120,0.85)',
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.25)',
    fontSize: '0.7rem',
    fontWeight: '800',
    marginLeft: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
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
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
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
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
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
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
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
            {isAdmin ? 'Admin' : 'Employee'}
          </span>
        </div>
        
        <button
          style={buttonStyle}
          onClick={handleLogout}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#E53E3E'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#F56565'}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
