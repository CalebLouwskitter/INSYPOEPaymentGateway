import { useNavigate, useLocation } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext.jsx';
import { useState, useEffect } from 'react';
import {
  COLORS,
  GLASS_STYLES,
  SPACING,
  BORDERS,
  TYPOGRAPHY,
  TRANSITIONS,
  BUTTON_STYLES,
  BREAKPOINTS,
  SHADOWS
} from '../constants/styles.js';

// References:
// React Router Team. (2025) useNavigate - React Router. Available at: https://reactrouter.com/en/main/hooks/use-navigate (Accessed: 03 November 2025).
// React Team. (2025) useEffect - React. Available at: https://react.dev/reference/react/useEffect (Accessed: 04 November 2025).

/**
 * Navigation component for employee portal
 * Shows different menu items based on user role
 */
export default function EmployeeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { employeeUser, isAdmin, employeeLogout } = useEmployeeAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < parseInt(BREAKPOINTS.md));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    await employeeLogout();
    navigate('/employee/login', { replace: true });
  };

  const handleKeyPress = (event, path) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(path);
      if (isMobile) {
        setIsMobileMenuOpen(false);
      }
    }
  };

  const handleMouseEnter = (event) => {
    if (!isMobile) {
      event.currentTarget.style.backgroundColor = COLORS.gray[100];
    }
  };

  const handleMouseLeave = (event, path) => {
    if (!isMobile && location.pathname !== path) {
      event.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = isAdmin
    ? []
    : [
        {
          path: '/employee/dashboard',
          label: 'Pending Payments',
          ariaLabel: 'Navigate to pending payments',
          icon: '⏳'
        },
        {
          path: '/employee/history',
          label: 'Payment History',
          ariaLabel: 'Navigate to payment history',
          icon: '📊'
        },
      ];

  const navStyle = {
    ...GLASS_STYLES.nav,
    color: COLORS.gray[800],
    padding: `${SPACING.sm} ${SPACING.lg}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: `${SPACING.sm} ${SPACING.md}`,
    position: 'sticky',
    top: 0,
    zIndex: 50,
  };

  const brandStyle = {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    flexShrink: 0,
  };

  const menuStyle = {
    display: isMobile ? (isMobileMenuOpen ? 'flex' : 'none') : 'flex',
    gap: SPACING.md,
    alignItems: 'center',
    flexDirection: isMobile ? 'column' : 'row',
    position: isMobile ? 'absolute' : 'static',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: isMobile ? COLORS.white : 'transparent',
    padding: isMobile ? SPACING.lg : '0',
    borderRadius: isMobile ? BORDERS.radius.lg : '0',
    boxShadow: isMobile ? SHADOWS.lg : 'none',
    marginTop: isMobile ? SPACING.sm : '0',
  };

  const linkStyle = (isActive) => ({
    padding: `${SPACING.sm} ${SPACING.md}`,
    borderRadius: BORDERS.radius.lg,
    cursor: 'pointer',
    backgroundColor: isActive ? COLORS.primary : 'transparent',
    border: isActive ? '1px solid transparent' : `1px solid ${COLORS.gray[200]}`,
    transition: TRANSITIONS.normal,
    textDecoration: 'none',
    color: isActive ? COLORS.white : COLORS.gray[700],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
    width: isMobile ? '100%' : 'auto',
    justifyContent: isMobile ? 'flex-start' : 'center',
  });

  const mobileMenuButtonStyle = {
    display: isMobile ? 'flex' : 'none',
    background: 'none',
    border: 'none',
    color: COLORS.gray[700],
    fontSize: TYPOGRAPHY.fontSize.lg,
    cursor: 'pointer',
    padding: SPACING.sm,
    borderRadius: BORDERS.radius.md,
    transition: TRANSITIONS.fast,
  };

  const userInfoStyle = {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    marginRight: isMobile ? '0' : SPACING.md,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    flexDirection: isMobile ? 'column' : 'row',
    width: isMobile ? '100%' : 'auto',
    textAlign: isMobile ? 'center' : 'left',
  };

  const roleBadgeStyle = {
    backgroundColor: isAdmin ? 'rgba(128,90,213,0.85)' : 'rgba(72,187,120,0.85)',
    padding: `${SPACING.xs} ${SPACING.sm}`,
    borderRadius: BORDERS.radius.full,
    border: '1px solid rgba(255,255,255,0.25)',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  return (
    <nav style={navStyle} role="navigation" aria-label="Employee portal navigation">
      <div style={brandStyle}>
        Payment Gateway - Employee Portal
      </div>
      
      {/* Mobile menu toggle button */}
      <button
        style={mobileMenuButtonStyle}
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileMenuOpen}
        onMouseEnter={(e) => e.target.style.backgroundColor = COLORS.gray[100]}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>
      
      <div style={menuStyle}>
        {/* Employee menu items */}
        {navLinks.map(({ path, label, ariaLabel, icon }) => (
          <div
            key={path}
            role="button"
            tabIndex={0}
            style={linkStyle(location.pathname === path)}
            onClick={() => navigate(path)}
            onKeyPress={(event) => handleKeyPress(event, path)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={(event) => handleMouseLeave(event, path)}
            aria-label={ariaLabel}
            aria-current={location.pathname === path ? 'page' : undefined}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </div>
        ))}

        {/* User info and logout */}
        <div style={userInfoStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
            <span aria-label="Current user">{employeeUser?.username}</span>
            <span style={roleBadgeStyle} aria-label={`User role: ${isAdmin ? 'Admin' : 'Employee'}`}>
              {isAdmin ? 'Admin' : 'Employee'}
            </span>
          </div>
          
          <button
            style={{
              ...BUTTON_STYLES.danger(),
              padding: `${SPACING.sm} ${SPACING.md}`,
              marginTop: isMobile ? SPACING.sm : '0',
              width: isMobile ? '100%' : 'auto'
            }}
            onClick={handleLogout}
            aria-label="Logout from employee portal"
            onMouseEnter={(e) => e.target.style.backgroundColor = COLORS.danger}
            onMouseLeave={(e) => e.target.style.backgroundColor = COLORS.danger}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
