import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';
import EmployeeNavigation from '../components/EmployeeNavigation';
import EmployeeTable from '../components/EmployeeTable';
import adminService from '../services/adminService';

// References:
// React Team. (2025) useEffect - React. Available at: https://react.dev/reference/react/useEffect (Accessed: 03 November 2025).

// Password validation constants to avoid magic numbers flagged by static analysis
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_REQUIREMENTS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isEmployeeAuthenticated, isAdmin, employeeUser } = useEmployeeAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    username: '',
    password: '',
    role: 'employee',
  });
  const [formErrors, setFormErrors] = useState({});

  // Redirect non-admin to employee dashboard
  useEffect(() => {
    if (isEmployeeAuthenticated && !isAdmin) {
      navigate('/employee/dashboard', { replace: true });
    }
  }, [isAdmin, isEmployeeAuthenticated, navigate]);

  // Fetch employees
  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getAllEmployees();
      if (response.success) {
        setEmployees(response.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId) => {
    setError('');
    setSuccessMessage('');
    try {
      const response = await adminService.deleteEmployee(employeeId);
      if (response.success) {
        setSuccessMessage('Employee deleted successfully! 🗑️');
        // Remove from list
        setEmployees(employees.filter(e => e._id !== employeeId));
        
        setTimeout(() => setSuccessMessage(''), 3000);
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
    if (!PASSWORD_REQUIREMENTS_REGEX.test(createFormData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and digit';
    }

    return errors;
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
    
    try {
      const response = await adminService.createEmployee(createFormData);
      if (response.success) {
        setSuccessMessage('Employee created successfully! ✓');
        // Refresh employee list
        fetchEmployees();
        // Reset form
        setCreateFormData({ username: '', password: '', role: 'employee' });
        setShowCreateForm(false);
        
        setTimeout(() => setSuccessMessage(''), 3000);
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
    }
  };

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '0',
  };

  const contentStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
  };

  const headerStyle = {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '1.5rem 2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const titleStyle = {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#667eea',
  };

  const buttonStyle = (isPrimary = false) => ({
    padding: '0.65rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    backgroundColor: isPrimary ? '#667eea' : '#48BB78',
    color: 'white',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
  });

  const formContainerStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '2rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    backgroundColor: '#F7FAFC',
  };

  const messageStyle = (isError) => ({
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    backgroundColor: isError ? '#FED7D7' : '#C6F6D5',
    border: `1px solid ${isError ? '#FC8181' : '#68D391'}`,
    color: isError ? '#C53030' : '#2F855A',
    fontWeight: '500',
  });

  const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  };

  const statCardStyle = (color) => ({
    backgroundColor: color,
    padding: '1.75rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease',
  });

  const statNumberStyle = (color) => ({
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'white',
  });

  const statLabelStyle = {
    fontSize: '0.95rem',
    color: 'white',
    marginTop: '0.5rem',
    fontWeight: '500',
    opacity: 0.95,
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
        <div style={headerStyle}>
          <h1 style={titleStyle}>Employee Management</h1>
          <button
            style={buttonStyle(false)}
            onClick={() => setShowCreateForm(!showCreateForm)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(72, 187, 120, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
            }}
          >
            {showCreateForm ? '✗ Cancel' : '+ Create Employee'}
          </button>
        </div>

        {/* Stats */}
        <div style={statsContainerStyle}>
          <div 
            style={statCardStyle('#9F7AEA')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={statNumberStyle('#9F7AEA')}>{employees.length}</div>
            <div style={statLabelStyle}>Total Employees</div>
          </div>
          <div 
            style={statCardStyle('#48BB78')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={statNumberStyle('#48BB78')}>{adminCount}</div>
            <div style={statLabelStyle}>Administrators</div>
          </div>
          <div 
            style={statCardStyle('#4299E1')}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={statNumberStyle('#4299E1')}>{employeeCount}</div>
            <div style={statLabelStyle}>Regular Employees</div>
          </div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div style={messageStyle(false)}>
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={messageStyle(true)}>
            {error}
          </div>
        )}

        {/* Create employee form */}
        {showCreateForm && (
          <div style={formContainerStyle}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: '1.5rem', 
              color: '#667eea',
            }}>
              Create New Employee
            </h2>
            <form onSubmit={handleCreateEmployee}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4A5568' }}>
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={createFormData.username}
                  onChange={handleFormChange}
                  placeholder="Enter username (letters, numbers, underscore)"
                  required
                  style={{
                    ...inputStyle,
                    borderColor: formErrors.username ? '#FC8181' : '#E2E8F0',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = formErrors.username ? '#FC8181' : '#E2E8F0';
                    e.target.style.backgroundColor = '#F7FAFC';
                  }}
                />
                {formErrors.username && (
                  <p style={{ color: '#C53030', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {formErrors.username}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4A5568' }}>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={createFormData.password}
                  onChange={handleFormChange}
                  placeholder="Enter password (min 6 chars, uppercase, lowercase, digit)"
                  required
                  style={{
                    ...inputStyle,
                    borderColor: formErrors.password ? '#FC8181' : '#E2E8F0',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = formErrors.password ? '#FC8181' : '#E2E8F0';
                    e.target.style.backgroundColor = '#F7FAFC';
                  }}
                />
                {formErrors.password && (
                  <p style={{ color: '#C53030', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4A5568' }}>
                  Role
                </label>
                <select
                  name="role"
                  value={createFormData.role}
                  onChange={handleFormChange}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.backgroundColor = '#F7FAFC';
                  }}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                style={buttonStyle(true)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
                }}
              >
                Create Employee
              </button>
            </form>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: '#718096', fontSize: '1rem', fontWeight: '500' }}>Loading employees...</p>
          </div>
        )}

        {/* Employee table */}
        {!loading && (
          <EmployeeTable
            employees={employees}
            onDelete={handleDelete}
            currentUserId={employeeUser?.id}
          />
        )}
      </div>
    </div>
  );
}
