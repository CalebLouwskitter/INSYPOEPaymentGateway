import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';
import EmployeeNavigation from '../components/EmployeeNavigation';
import EmployeeTable from '../components/EmployeeTable';
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
const PASSWORD_MIN_LENGTH = 6;
// NOSONAR: This regex validates password complexity requirements (not a hardcoded credential)
const PASSWORD_REQUIREMENTS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isEmployeeAuthenticated, isAdmin, employeeUser } = useEmployeeAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    username: '',
    password: '',
    role: 'employee',
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect non-admin to employee dashboard
  useEffect(() => {
    if (isEmployeeAuthenticated && !isAdmin) {
      navigate('/employee/dashboard', { replace: true });
    }
  }, [isAdmin, isEmployeeAuthenticated, navigate]);

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch employees with error handling
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await adminService.getAllEmployees();
      if (response.success) {
        setEmployees(response.employees || []);
      } else {
        throw new Error(response.message || 'Failed to load employees');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin, fetchEmployees]);

  const handleDelete = async (employeeId) => {
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await adminService.deleteEmployee(employeeId);
      if (response.success) {
        setSuccessMessage('Employee deleted successfully! 🗑️');
        setEmployees(prev => prev.filter(e => e._id !== employeeId));
      } else {
        throw new Error(response.message || 'Failed to delete employee');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError(err.message || 'Failed to delete employee');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Remove potentially harmful characters
    sanitizedValue = sanitizedValue.replace(/[<>]/g, "");

    // Username validation: alphanumeric and underscore only
    if (name === 'username') {
      sanitizedValue = sanitizedValue.replace(/[^a-zA-Z0-9_]/g, "");
      sanitizedValue = sanitizedValue.slice(0, 50);
    }

    setCreateFormData({ ...createFormData, [name]: sanitizedValue });
    setFormErrors({ ...formErrors, [name]: '' });
    setError('');

    // Calculate password strength
    if (name === 'password') {
      let strength = 0;
      if (value.length >= PASSWORD_MIN_LENGTH) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/\d/.test(value)) strength++;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) strength++;
      setPasswordStrength(strength);
    }
  };

  const validateCreateForm = () => {
    const errors = {};

    // Username validation (alphanumeric + underscore, 3-50 chars)
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(createFormData.username)) {
      errors.username = 'Username must be 3-50 characters (letters, numbers, underscore only)';
    }

    // Password validation (min length and complexity requirements)
    if (createFormData.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    // NOSONAR: Validation regex checks password strength, not a credential
    if (!PASSWORD_REQUIREMENTS_REGEX.test(createFormData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and digit';
    }

    return errors;
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return COLORS.danger;
    if (passwordStrength <= 3) return COLORS.warning;
    return COLORS.success;
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    
    const errors = validateCreateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError('Please correct the highlighted fields');
      return;
    }

    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      const response = await adminService.createEmployee(createFormData);
      if (response.success) {
        setSuccessMessage('Employee created successfully! ✓');
        await fetchEmployees(); // Refresh employee list
        // Reset form
        setCreateFormData({ username: '', password: '', role: 'employee' });
        setShowCreateForm(false);
        setPasswordStrength(0);
      } else {
        throw new Error(response.message || 'Failed to create employee');
      }
    } catch (err) {
      console.error('Error creating employee:', err);
      if (err.errors && Array.isArray(err.errors)) {
        const apiErrors = {};
        err.errors.forEach(error => {
          if (error.param) {
            apiErrors[error.param] = error.msg;
          }
        });
        setFormErrors(apiErrors);
      }
      setError(err.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCreateFormData({ username: '', password: '', role: 'employee' });
    setFormErrors({});
    setPasswordStrength(0);
    setShowCreateForm(false);
    setError('');
  };

  // Component styles using shared constants
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: COLORS.gray[50],
    padding: '0',
  };

  const contentStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: SPACING.xl,
  };

  const headerStyle = {
    marginBottom: SPACING.xl,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: `${SPACING.lg} ${SPACING.xl}`,
    borderRadius: BORDERS.radius.lg,
    boxShadow: SHADOWS.md,
    flexWrap: 'wrap',
    gap: SPACING.md,
  };

  const titleStyle = {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  };

  const formContainerStyle = {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: BORDERS.radius.lg,
    boxShadow: SHADOWS.md,
    marginBottom: SPACING.xl,
  };

  const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  };

  const statCardStyle = (color) => ({
    backgroundColor: color,
    padding: `${SPACING.lg} ${SPACING.md}`,
    borderRadius: BORDERS.radius.lg,
    boxShadow: SHADOWS.md,
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
  });

  const statNumberStyle = {
    fontSize: TYPOGRAPHY.fontSize['5xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.white,
  };

  const statLabelStyle = {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.white,
    marginTop: SPACING.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    opacity: 0.95,
  };

  const passwordStrengthStyle = {
    height: '4px',
    borderRadius: BORDERS.radius.full,
    backgroundColor: COLORS.gray[200],
    marginTop: SPACING.sm,
    overflow: 'hidden',
  };

  const passwordStrengthBarStyle = {
    height: '100%',
    width: `${(passwordStrength / 5) * 100}%`,
    backgroundColor: getPasswordStrengthColor(),
    transition: 'all 0.3s ease',
  };

  const passwordStrengthTextStyle = {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: getPasswordStrengthColor(),
    marginTop: SPACING.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  };

  // Calculate stats
  const adminCount = employees.filter(e => e.role === 'admin').length;
  const employeeCount = employees.filter(e => e.role === 'employee').length;

  if (!isEmployeeAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <EmployeeNavigation />
      
      <div style={contentStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <h1 style={titleStyle}>Employee Management</h1>
          <button
            style={BUTTON_STYLES.success()}
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={isSubmitting}
            aria-label={showCreateForm ? 'Cancel creating employee' : 'Create new employee'}
            aria-expanded={showCreateForm}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = SHADOWS.md;
              }
            }}
          >
            {showCreateForm ? '✗ Cancel' : '+ Create Employee'}
          </button>
        </header>

        {/* Stats */}
        <section style={statsContainerStyle} aria-label="Employee statistics">
          <div 
            style={statCardStyle(COLORS.purple)}
            onClick={fetchEmployees}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fetchEmployees();
              }
            }}
            aria-label="Refresh employee data"
          >
            <div style={statNumberStyle}>{employees.length}</div>
            <div style={statLabelStyle}>Total Employees</div>
          </div>
          <div 
            style={statCardStyle(COLORS.success)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={statNumberStyle}>{adminCount}</div>
            <div style={statLabelStyle}>Administrators</div>
          </div>
          <div 
            style={statCardStyle(COLORS.info)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={statNumberStyle}>{employeeCount}</div>
            <div style={statLabelStyle}>Regular Employees</div>
          </div>
        </section>

        {/* Success message */}
        {successMessage && (
          <div 
            style={MESSAGE_STYLES.container(false)}
            role="alert"
            aria-live="polite"
          >
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div 
            style={MESSAGE_STYLES.container(true)}
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* Create employee form */}
        {showCreateForm && (
          <section style={formContainerStyle} aria-label="Create new employee form">
            <h2 style={{ 
              fontSize: TYPOGRAPHY.fontSize['3xl'], 
              fontWeight: TYPOGRAPHY.fontWeight.semibold, 
              marginBottom: SPACING.lg, 
              color: COLORS.primary,
            }}>
              Create New Employee
            </h2>
            <form onSubmit={handleCreateEmployee} noValidate>
              <div style={{ marginBottom: SPACING.md }}>
                <label 
                  htmlFor="username"
                  style={FORM_STYLES.label}
                >
                  Username *
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={createFormData.username}
                  onChange={handleFormChange}
                  placeholder="Enter username (letters, numbers, underscore)"
                  required
                  aria-required="true"
                  aria-describedby="username-error"
                  style={{
                    ...FORM_STYLES.input,
                    borderColor: formErrors.username ? COLORS.danger : COLORS.gray[200],
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.primary;
                    e.target.style.backgroundColor = COLORS.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = formErrors.username ? COLORS.danger : COLORS.gray[200];
                    e.target.style.backgroundColor = COLORS.gray[50];
                  }}
                />
                {formErrors.username && (
                  <p 
                    id="username-error"
                    style={FORM_STYLES.error}
                    role="alert"
                  >
                    {formErrors.username}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: SPACING.md }}>
                <label 
                  htmlFor="password"
                  style={FORM_STYLES.label}
                >
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={createFormData.password}
                  onChange={handleFormChange}
                  placeholder="Enter password (min 6 chars, uppercase, lowercase, digit)"
                  required
                  aria-required="true"
                  aria-describedby="password-error password-strength"
                  style={{
                    ...FORM_STYLES.input,
                    borderColor: formErrors.password ? COLORS.danger : COLORS.gray[200],
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.primary;
                    e.target.style.backgroundColor = COLORS.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = formErrors.password ? COLORS.danger : COLORS.gray[200];
                    e.target.style.backgroundColor = COLORS.gray[50];
                  }}
                />
                
                {/* Password strength indicator */}
                {createFormData.password && (
                  <div>
                    <div style={passwordStrengthStyle}>
                      <div style={passwordStrengthBarStyle} />
                    </div>
                    <p 
                      id="password-strength"
                      style={passwordStrengthTextStyle}
                    >
                      Password strength: {getPasswordStrengthText()}
                    </p>
                  </div>
                )}
                
                {formErrors.password && (
                  <p 
                    id="password-error"
                    style={FORM_STYLES.error}
                    role="alert"
                  >
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: SPACING.lg }}>
                <label 
                  htmlFor="role"
                  style={FORM_STYLES.label}
                >
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={createFormData.role}
                  onChange={handleFormChange}
                  required
                  aria-required="true"
                  style={FORM_STYLES.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = COLORS.primary;
                    e.target.style.backgroundColor = COLORS.white;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = COLORS.gray[200];
                    e.target.style.backgroundColor = COLORS.gray[50];
                  }}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: SPACING.md, alignItems: 'center' }}>
                <button
                  type="submit"
                  style={BUTTON_STYLES.primary(isSubmitting)}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = SHADOWS.md;
                    }
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Employee'}
                </button>
                
                <button
                  type="button"
                  style={{
                    ...BUTTON_STYLES.danger(),
                    backgroundColor: COLORS.gray[400]
                  }}
                  onClick={resetForm}
                  disabled={isSubmitting}
                  aria-label="Cancel and reset form"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Loading state */}
        {loading && (
          <div style={LOADING_STYLES.container} role="status" aria-live="polite">
            <div style={LOADING_STYLES.icon}>⏳</div>
            <p style={LOADING_STYLES.text}>Loading employees...</p>
          </div>
        )}

        {/* Employee table */}
        {!loading && (
          <main>
            <EmployeeTable
              employees={employees}
              onDelete={handleDelete}
              currentUserId={employeeUser?.id}
            />
          </main>
        )}
      </div>
    </div>
  );
}
