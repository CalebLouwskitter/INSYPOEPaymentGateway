import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmployeeAuth } from "../context/EmployeeAuthContext";
import Icon from "../components/Icon";
import cityscapeImage from "../assets/pexels-anete-lusina-4792381.webp";
import "../styles/branding.css";

// References:
// React Team. (2025) useState - React. Available at: https://react.dev/reference/react/useState (Accessed: 03 November 2025).
// React Router Team. (2025) useNavigate - React Router. Available at: https://reactrouter.com/en/main/hooks/use-navigate (Accessed: 03 November 2025).
// Password validation constant to avoid magic number flagged by static analysis
const PASSWORD_MIN_LENGTH = 6;

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const { employeeLogin, isEmployeeAuthenticated, isAdmin } = useEmployeeAuth();

  // Theme colors
  const PRIMARY_COLOR = '#8B5CF6';
  const BUTTON_COLOR = '#4F46E5';
  const DARK_TEXT = '#1F2937';
  const ERROR_COLOR = '#EF4444';

  // Input style
  const inputStyle = {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '10px',
    boxSizing: 'border-box',
    backgroundColor: '#F3F4F6',
    border: '1px solid #D1D5DB',
    color: DARK_TEXT,
    transition: 'border-color 0.3s, background-color 0.3s',
  };

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isEmployeeAuthenticated) {
      // Redirect based on role
      if (isAdmin) {
        navigate('/employee/admin', { replace: true });
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    }
  }, [isEmployeeAuthenticated, isAdmin, navigate]);

  // Sanitize and validate input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Remove potentially harmful characters
    sanitizedValue = sanitizedValue.replace(/[<>]/g, "");

    // Username validation: alphanumeric and underscore only
    if (name === 'username') {
      sanitizedValue = sanitizedValue.replace(/[^a-zA-Z0-9_]/g, "");
      sanitizedValue = sanitizedValue.slice(0, 50); // Max 50 chars
    }

    setFormData({ ...formData, [name]: sanitizedValue });
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = PRIMARY_COLOR;
    e.target.style.backgroundColor = 'white';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#D1D5DB';
    e.target.style.backgroundColor = '#F3F4F6';
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    const validationErrors = {};

    // Validate username with RegEx (whitelist pattern: alphanumeric + underscore)
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(formData.username)) {
      validationErrors.username = "Username must be 3-50 characters (letters, numbers, underscore only)";
    }

    // Validate password length using constant
    if (!formData.password || formData.password.length < PASSWORD_MIN_LENGTH) {
      validationErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError('Please correct the highlighted fields.');
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const result = await employeeLogin({
        username: formData.username,
        password: formData.password,
      });

      if (result.success) {
        // Redirect based on role
        if (result.employee.role === 'admin') {
          navigate('/employee/admin', { replace: true });
        } else {
          navigate('/employee/dashboard', { replace: true });
        }
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error("Employee login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="brand-auth-page"
      style={{
        '--brand-page-image': `url(${cityscapeImage})`,
        '--brand-page-overlay': 'linear-gradient(135deg, rgba(17, 17, 35, 0.85), rgba(39, 30, 90, 0.9))',
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'transparent',
        padding: '2rem',
        width: '100%',
      }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%',
        padding: '3rem',
        margin: 0,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: DARK_TEXT,
            marginBottom: '0.5rem',
          }}>
            Employee Portal
          </h1>
          <p style={{
            color: '#6B7280',
            fontSize: '1rem',
          }}>
            Sign in to access the payment management system
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            border: `1px solid ${ERROR_COLOR}`,
            color: ERROR_COLOR,
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin}>
          {/* Username field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: DARK_TEXT,
            }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Enter your username"
              required
              autoComplete="username"
              style={{
                ...inputStyle,
                borderColor: fieldErrors.username ? ERROR_COLOR : '#D1D5DB',
              }}
            />
            {fieldErrors.username && (
              <p style={{
                color: ERROR_COLOR,
                fontSize: '0.875rem',
                marginTop: '0.5rem',
              }}>
                {fieldErrors.username}
              </p>
            )}
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: DARK_TEXT,
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                style={{
                  ...inputStyle,
                  borderColor: fieldErrors.password ? ERROR_COLOR : '#D1D5DB',
                  paddingRight: '45px',
                }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280',
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon
                  name={showPassword ? 'visibility_off' : 'visibility'}
                  size={22}
                  title={showPassword ? 'Hide password' : 'Show password'}
                />
              </button>
            </div>
            {fieldErrors.password && (
              <p style={{
                color: ERROR_COLOR,
                fontSize: '0.875rem',
                marginTop: '0.5rem',
              }}>
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#9CA3AF' : BUTTON_COLOR,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = PRIMARY_COLOR;
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = BUTTON_COLOR;
            }}
            onMouseDown={(e) => {
              if (!loading) e.target.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              if (!loading) e.target.style.transform = 'scale(1)';
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Security notice */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#F3F4F6',
          borderRadius: '10px',
          fontSize: '0.85rem',
          color: '#6B7280',
          textAlign: 'center',
        }}>
          Secure employee access only. All activity is logged.
        </div>

        {/* Customer portal link */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#6B7280',
        }}>
          Not an employee?{' '}
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/login')}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate('/login');
              }
            }}
            style={{
              color: PRIMARY_COLOR,
              cursor: 'pointer',
              fontWeight: '600',
              textDecoration: 'underline',
            }}
            aria-label="Navigate to customer portal"
          >
            Go to Customer Portal
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}
