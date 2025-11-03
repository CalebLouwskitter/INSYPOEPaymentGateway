import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeAuth } from '../context/EmployeeAuthContext';
import EmployeeNavigation from '../components/EmployeeNavigation';
import EmployeeTable from '../components/EmployeeTable';
import adminService from '../services/adminService';

// References:
// React Team. (2025) useEffect - React. Available at: https://react.dev/reference/react/useEffect (Accessed: 03 November 2025).

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

    // Password validation (min 6 chars, must have uppercase, lowercase, digit)
    if (createFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(createFormData.password)) {
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
    backgroundColor: '#F9FAFB',
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
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1F2937',
  };

  const buttonStyle = (isPrimary = false) => ({
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    backgroundColor: isPrimary ? '#8B5CF6' : '#10B981',
    color: 'white',
    transition: 'opacity 0.3s',
  });

  const formContainerStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #D1D5DB',
    boxSizing: 'border-box',
  };

  const messageStyle = (isError) => ({
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    backgroundColor: isError ? '#FEE2E2' : '#D1FAE5',
    border: `1px solid ${isError ? '#EF4444' : '#10B981'}`,
    color: isError ? '#EF4444' : '#065F46',
  });

  const statsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const statCardStyle = (color) => ({
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderLeft: `4px solid ${color}`,
  });

  const statNumberStyle = (color) => ({
    fontSize: '2rem',
    fontWeight: 'bold',
    color: color,
  });

  const statLabelStyle = {
    fontSize: '0.9rem',
    color: '#6B7280',
    marginTop: '0.5rem',
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
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            {showCreateForm ? '✗ Cancel' : '+ Create Employee'}
          </button>
        </div>

        {/* Stats */}
        <div style={statsContainerStyle}>
          <div style={statCardStyle('#8B5CF6')}>
            <div style={statNumberStyle('#8B5CF6')}>{employees.length}</div>
            <div style={statLabelStyle}>Total Employees</div>
          </div>
          <div style={statCardStyle('#10B981')}>
            <div style={statNumberStyle('#10B981')}>{adminCount}</div>
            <div style={statLabelStyle}>Administrators</div>
          </div>
          <div style={statCardStyle('#3B82F6')}>
            <div style={statNumberStyle('#3B82F6')}>{employeeCount}</div>
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1F2937' }}>
              Create New Employee
            </h2>
            <form onSubmit={handleCreateEmployee}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
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
                    borderColor: formErrors.username ? '#EF4444' : '#D1D5DB',
                  }}
                />
                {formErrors.username && (
                  <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {formErrors.username}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
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
                    borderColor: formErrors.password ? '#EF4444' : '#D1D5DB',
                  }}
                />
                {formErrors.password && (
                  <p style={{ color: '#EF4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Role
                </label>
                <select
                  name="role"
                  value={createFormData.role}
                  onChange={handleFormChange}
                  style={inputStyle}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                style={buttonStyle(true)}
                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
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
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ color: '#6B7280' }}>Loading employees...</p>
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
