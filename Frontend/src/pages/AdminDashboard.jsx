import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';
// import EmployeeNavigation from '../components/EmployeeNavigation';
import EmployeeTable from '../components/EmployeeTable';
import Icon from '../components/Icon';
import adminService from '../services/adminService';
import {
  COLORS,
  SPACING,
  BORDERS,
  TYPOGRAPHY,
  SHADOWS,
  MESSAGE_STYLES,
  LOADING_STYLES,
  BUTTON_STYLES,
  FORM_STYLES
} from '../constants/styles.js';

// References:
// React Team. (2025) useEffect - React. Available at: https://react.dev/reference/react/useEffect (Accessed: 03 November 2025).
// React Team. (2025) useCallback - React. Available at: https://react.dev/reference/react/useCallback (Accessed: 04 November 2025).

// Password validation constants to avoid magic numbers flagged by static analysis
// Note: These are validation rules, not actual passwords or secrets

// --- Constants for SonarQube & Readability ---
const FORM_FIELDS = {
  USERNAME: 'username',
  PASSWORD: 'password',
  ROLE: 'role',
};

const USER_ROLES = {
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
};

const PASSWORD_MIN_LENGTH = 6;
// NOSONAR: This regex validates password complexity requirements (not a hardcoded credential)
const PASSWORD_REQUIREMENTS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

// ============================================================================
//  1. Sub-component: StatCard (for better reusability and cleaner JSX)
// ============================================================================
const StatCard = ({ icon, label, value, color, onAction, actionLabel }) => {
  const [hover, setHover] = useState(false);
  const baseStyle = styles.statCard(color);
  const hoverStyle = hover ? { transform: 'translateY(-4px)', boxShadow: SHADOWS.lg } : {};
  return (
    <div
      style={{ ...baseStyle, ...hoverStyle }}
      onClick={onAction}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onAction?.()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role={onAction ? "button" : "figure"}
      tabIndex={onAction ? 0 : -1}
      aria-label={actionLabel || `${label}: ${value}`}
    >
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
};

// ============================================================================
//  2. Sub-component: CreateEmployeeForm (encapsulates form logic and state)
// ============================================================================
const CreateEmployeeForm = ({ onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    [FORM_FIELDS.USERNAME]: '',
    [FORM_FIELDS.PASSWORD]: '',
    [FORM_FIELDS.ROLE]: USER_ROLES.EMPLOYEE,
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const usernameInputRef = useRef(null);

  // WCAG Improvement: Automatically focus the first input when the form appears
  useEffect(() => {
    usernameInputRef.current?.focus();
  }, []);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= PASSWORD_MIN_LENGTH) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return strength;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Sanitize username input to allowed characters
    if (name === FORM_FIELDS.USERNAME) {
      sanitizedValue = sanitizedValue.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 50);
    }
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    setFormErrors(prev => ({ ...prev, [name]: '' }));

    if (name === FORM_FIELDS.PASSWORD) {
      setPasswordStrength(calculatePasswordStrength(sanitizedValue));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(formData.username)) {
      errors.username = 'Username must be 3-50 characters (letters, numbers, underscore only)';
    }
    if (formData.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    } else if (!PASSWORD_REQUIREMENTS_REGEX.test(formData.password)) {
      errors.password = 'Password must contain an uppercase letter, a lowercase letter, and a digit.';
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    onSubmit(formData);
  };
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return COLORS.danger;
    if (passwordStrength <= 3) return COLORS.warning;
    return COLORS.success;
  };

  return (
    <section style={styles.formContainer} aria-labelledby="form-title">
      <h2 id="form-title" style={styles.formTitle}>Create New Employee</h2>
      <form onSubmit={handleSubmit} noValidate>
        {/* Username Input */}
        <div style={styles.formGroup}>
          <label htmlFor={FORM_FIELDS.USERNAME} style={FORM_STYLES.label}>Username *</label>
          <input
            ref={usernameInputRef}
            id={FORM_FIELDS.USERNAME}
            type="text"
            name={FORM_FIELDS.USERNAME}
            value={formData.username}
            onChange={handleFormChange}
            placeholder="Enter username (letters, numbers, underscore)"
            style={formErrors.username ? styles.inputError : FORM_STYLES.input}
            required
            aria-required="true"
            aria-describedby="username-error"
            aria-invalid={!!formErrors.username}
            onFocus={(e) => {
              e.target.style.borderColor = COLORS.primary;
              e.target.style.backgroundColor = COLORS.white;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = formErrors.username ? COLORS.danger : COLORS.gray[200];
              e.target.style.backgroundColor = COLORS.gray[50];
            }}
          />
          {formErrors.username && <p id="username-error" style={FORM_STYLES.error} role="alert">{formErrors.username}</p>}
        </div>

        {/* Password Input */}
        <div style={styles.formGroup}>
          <label htmlFor={FORM_FIELDS.PASSWORD} style={FORM_STYLES.label}>Password *</label>
          <input
            id={FORM_FIELDS.PASSWORD}
            type="password"
            name={FORM_FIELDS.PASSWORD}
            value={formData.password}
            onChange={handleFormChange}
            placeholder="Enter password (min 6 chars, uppercase, lowercase, digit)"
            style={formErrors.password ? styles.inputError : FORM_STYLES.input}
            required
            aria-required="true"
            aria-describedby="password-error password-strength-text"
            aria-invalid={!!formErrors.password}
            onFocus={(e) => {
              e.target.style.borderColor = COLORS.primary;
              e.target.style.backgroundColor = COLORS.white;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = formErrors.password ? COLORS.danger : COLORS.gray[200];
              e.target.style.backgroundColor = COLORS.gray[50];
            }}
          />
          {formData.password && (
            <div id="password-strength-text">
              <div style={styles.passwordStrengthBarContainer}>
                <div style={{...styles.passwordStrengthBar, width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getPasswordStrengthColor() }} />
              </div>
              <p style={{...styles.passwordStrengthText, color: getPasswordStrengthColor()}}>
                Strength: {['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][passwordStrength - 1] || 'Weak'}
              </p>
            </div>
          )}
          {formErrors.password && <p id="password-error" style={FORM_STYLES.error} role="alert">{formErrors.password}</p>}
        </div>

        {/* Role Select */}
        <div style={styles.formGroup}>
          <label htmlFor={FORM_FIELDS.ROLE} style={FORM_STYLES.label}>Role *</label>
          <select
            id={FORM_FIELDS.ROLE}
            name={FORM_FIELDS.ROLE}
            value={formData.role}
            onChange={handleFormChange}
            style={FORM_STYLES.input}
            required
            aria-required="true"
          >
            <option value={USER_ROLES.EMPLOYEE}>Employee</option>
            <option value={USER_ROLES.ADMIN}>Administrator</option>
          </select>
        </div>
        
        {/* Action Buttons */}
        <div style={styles.formActions}>
          <button type="submit" style={BUTTON_STYLES.primary(isSubmitting)} disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Employee'}
          </button>
          <button type="button" style={BUTTON_STYLES.secondary?.() || BUTTON_STYLES.danger()} onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
};


// ============================================================================
//  3. Main Component: AdminDashboard (Container Component)
// ============================================================================
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isEmployeeAuthenticated, isAdmin, employeeUser, employeeLogout } = useEmployeeAuth();

  // State for the main dashboard
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState(null);
  
  // State to control UI visibility
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (isEmployeeAuthenticated && !isAdmin) {
      navigate('/employee/dashboard', { replace: true });
    }
  }, [isAdmin, isEmployeeAuthenticated, navigate]);

  // Auto-clear success messages for better UX
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getAllEmployees();
      setEmployees(response.success ? response.employees || [] : []);
      if (!response.success) throw new Error(response.message || 'Failed to load employees');
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'An unexpected error occurred while fetching employees.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchEmployees();
  }, [isAdmin, fetchEmployees]);
  
  const handleCreateEmployee = async (formData) => {
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      const response = await adminService.createEmployee(formData);
      if (response.success) {
        setSuccessMessage('Employee created successfully! ✓');
        setShowCreateForm(false);
        await fetchEmployees(); // Refresh list after creation
      } else {
        throw new Error(response.message || 'Failed to create employee');
      }
    } catch (err) {
      console.error('Error creating employee:', err);
      setError(err.message || 'An unexpected error occurred while creating the employee.');
      // Note: Field-specific errors are now handled within the form component.
      // This top-level error is for general API failures.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    setError('');
    setSuccessMessage('');
    try {
      const response = await adminService.deleteEmployee(employeeId);
      if (response.success) {
        setSuccessMessage('Employee deleted successfully! 🗑️');
        // Optimistic UI update: remove from list immediately
        setEmployees(prev => prev.filter(e => e._id !== employeeId));
      } else {
        throw new Error(response.message || 'Failed to delete employee');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError(err.message || 'Failed to delete employee');
    }
  };

  // Performance: Memoize stats calculation
  const { totalCount, adminCount, employeeCount } = useMemo(() => {
    const adminCount = employees.filter(e => e.role === USER_ROLES.ADMIN).length;
    return {
        totalCount: employees.length,
        adminCount,
        employeeCount: employees.length - adminCount,
    };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    if (roleFilter === USER_ROLES.ADMIN) return employees.filter(e => e.role === USER_ROLES.ADMIN);
    if (roleFilter === USER_ROLES.EMPLOYEE) return employees.filter(e => e.role === USER_ROLES.EMPLOYEE);
    return employees;
  }, [employees, roleFilter]);

  // Render null if user is not an authenticated admin (guard clause)
  if (!isEmployeeAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div style={styles.container}>
      
      <div style={styles.content}>
        <header style={styles.header}>
          <h1 style={styles.title}>Employee Management</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md, flexWrap: 'wrap' }}>
            <span style={{ color: COLORS.gray[600], fontWeight: TYPOGRAPHY.fontWeight.semibold }}>
              Signed in as: {employeeUser?.username || 'Admin'}
            </span>
            <button
              style={showCreateForm ? BUTTON_STYLES.secondary() : BUTTON_STYLES.success()}
              onClick={() => setShowCreateForm(prev => !prev)}
              disabled={isSubmitting}
              aria-expanded={showCreateForm}
              aria-controls="create-employee-form"
              aria-label={showCreateForm ? 'Cancel creating employee' : 'Create new employee'}
            >
              {showCreateForm ? '✗ Cancel' : '+ Create Employee'}
            </button>
            <button
              style={BUTTON_STYLES.secondary()}
              onClick={() => { employeeLogout(); navigate('/'); }}
              aria-label="Logout"
            >
              Logout
            </button>
          </div>
        </header>

        {/* --- UI Messages --- */}
        {successMessage && <div style={MESSAGE_STYLES.container(false)} role="alert" aria-live="polite">{successMessage}</div>}
        {error && <div style={MESSAGE_STYLES.container(true)} role="alert" aria-live="assertive">{error}</div>}

        {/* --- Stats Section --- */}
        <section style={styles.statsContainer} aria-label="Employee statistics">
          <StatCard
            icon={null}
            label="Total Employees"
            value={totalCount}
            color={COLORS.purple}
            onAction={() => setRoleFilter(null)}
            actionLabel="Refresh employee data"
          />
          <StatCard
            icon={null}
            label="Administrators"
            value={adminCount}
            color={COLORS.success}
            onAction={() => setRoleFilter(USER_ROLES.ADMIN)}
          />
            <StatCard
            icon={null}
            label="Regular Employees"
            value={employeeCount}
            color={COLORS.info}
            onAction={() => setRoleFilter(USER_ROLES.EMPLOYEE)}
          />
        </section>

        {/* --- Create Form (Conditional) --- */}
        {showCreateForm && (
          <div id="create-employee-form">
            <CreateEmployeeForm 
              onSubmit={handleCreateEmployee}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* --- Main Content: Table or Loading State --- */}
        <main>
          {loading ? (
            <div style={LOADING_STYLES.container} role="status" aria-live="polite">
              <div style={LOADING_STYLES.icon}><Icon name="hourglass_top" size={40} title="Loading" /></div>
              <p style={LOADING_STYLES.text}>Loading employees...</p>
            </div>
          ) : (
            <EmployeeTable
              employees={filteredEmployees}
              onDelete={handleDeleteEmployee}
              currentUserId={employeeUser?.id}
            />
          )}
        </main>
      </div>
    </div>
  );
}


// ============================================================================
//  4. Co-located Styles (for better readability and easier management)
// ============================================================================
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: COLORS.gray[50],
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xl,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    padding: `${SPACING.lg} ${SPACING.xl}`,
    borderRadius: BORDERS.radius.lg,
    boxShadow: SHADOWS.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    margin: 0,
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statCard: (color) => ({
    backgroundColor: color,
    color: COLORS.white, // WCAG: Ensure white text has enough contrast on this background color
    padding: SPACING.lg,
    borderRadius: BORDERS.radius.lg,
    boxShadow: SHADOWS.sm,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  }),
  statIcon: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize['5xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    opacity: 0.9,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: BORDERS.radius.lg,
    boxShadow: SHADOWS.md,
    marginBottom: SPACING.xl,
    border: `1px solid ${COLORS.gray[200]}`,
  },
  formTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginBottom: SPACING.lg,
    color: COLORS.primary,
  },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  formActions: {
    display: 'flex',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  inputError: {
    ...FORM_STYLES.input,
    borderColor: COLORS.danger, // WCAG: Ensure this red has enough contrast.
    '--tw-ring-color': COLORS.danger, // For focus ring if using Tailwind-like system
  },
  passwordStrengthBarContainer: {
    height: '6px',
    width: '100%',
    backgroundColor: COLORS.gray[200],
    borderRadius: BORDERS.radius.full,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  passwordStrengthBar: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },
  passwordStrengthText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    color: COLORS.gray[600],
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: `5px solid ${COLORS.gray[200]}`,
    borderBottomColor: COLORS.primary,
    borderRadius: '50%',
    display: 'inline-block',
    boxSizing: 'border-box',
    animation: 'rotation 1s linear infinite',
    // Keyframes should be defined in a global CSS file
    // @keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
};
