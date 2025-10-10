import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../interfaces/axiosInstance";
import { useAuth } from "../context/AuthContext.jsx";
import cityscapeImage from "../assets/pexels-anete-lusina-4792381.webp";
import abstractImage from "../assets/pexels-disha-sheta-596631-3521353.webp";

// References:
// Meta Platforms, Inc. (2025) React - A JavaScript library for building user interfaces. Available at: https://reactjs.org/ (Accessed: 07 January 2025).
// Remix Software, Inc. (2025) React Router - Declarative routing for React. Available at: https://reactrouter.com/ (Accessed: 07 January 2025).

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    accountNumber: '',
    nationalId: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const PRIMARY_COLOR = '#8B5CF6';
  const BUTTON_COLOR = '#4F46E5';
  const DARK_TEXT = '#1F2937';

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value.replace(/[<>]/g, "");

    if (name === 'accountNumber') {
      sanitizedValue = sanitizedValue.replace(/\D/g, "").slice(0, 10);
    }

    if (name === 'nationalId') {
      sanitizedValue = sanitizedValue.replace(/\D/g, "").slice(0, 13);
    }

    if (name === 'fullName') {
      sanitizedValue = sanitizedValue.replace(/[^a-zA-Z\s'-]/g, "");
    }

    setFormData({ ...formData, [name]: sanitizedValue });
    setError('');
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    e.target.setCustomValidity('');
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputFocus = (e) => {
    e.target.style.borderColor = PRIMARY_COLOR;
    e.target.style.backgroundColor = 'white';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#D1D5DB';
    e.target.style.backgroundColor = '#F3F4F6';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fullNameInput = form.elements.fullName;
    const accountInput = form.elements.accountNumber;
    const nationalIdInput = form.elements.nationalId;
    const passwordInput = form.elements.password;
    const confirmPasswordInput = form.elements.confirmPassword;

    fullNameInput.setCustomValidity("");
    accountInput.setCustomValidity("");
    nationalIdInput.setCustomValidity("");
    passwordInput.setCustomValidity("");
    confirmPasswordInput.setCustomValidity("");

    const validationErrors = {};

    // Validate full name (at least 3 characters, letters and spaces only)
    if (!/^[a-zA-Z\s]{3,}$/.test(formData.fullName)) {
      const message = "Please enter a valid full name (at least 3 characters, letters only).";
      fullNameInput.setCustomValidity(message);
      validationErrors.fullName = message;
    }

    if (!/^\d{10}$/.test(formData.accountNumber)) {
      const message = "Please enter exactly 10 digits for your Account Number.";
      accountInput.setCustomValidity(message);
      validationErrors.accountNumber = message;
    }

    if (!/^\d{13}$/.test(formData.nationalId)) {
      const message = "Please enter exactly 13 digits for your National ID.";
      nationalIdInput.setCustomValidity(message);
      validationErrors.nationalId = message;
    }

    if (formData.password.length < 6) {
      const message = "Password must be at least 6 characters long.";
      passwordInput.setCustomValidity(message);
      validationErrors.password = message;
    }

    if (formData.password !== formData.confirmPassword) {
      const message = "Passwords do not match. Please verify.";
      confirmPasswordInput.setCustomValidity(message);
      validationErrors.confirmPassword = message;
    }

    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setError('Please correct the highlighted fields.');
      form.reportValidity();
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      console.log("📤 Sending registration request:", { 
        fullName: formData.fullName, 
        accountNumber: formData.accountNumber,
        nationalId: formData.nationalId
      });

      // Make API call to register endpoint
      const response = await axiosInstance.post('/auth/register', {
        fullName: formData.fullName,
        accountNumber: formData.accountNumber,
        nationalId: formData.nationalId,
        password: formData.password
      });

      console.log("✅ Registration Success:", response.data);

      // Store token and user info in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Show success message and redirect to login
      alert('Registration successful! Please login with your credentials.');
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("❌ Registration error:", err);
      
      // Handle error response
      if (err.response?.data?.errors?.length) {
        const apiFieldErrors = err.response.data.errors.reduce((acc, current) => {
          if (current.param) {
            acc[current.param] = current.msg;
            const inputElement = form.elements[current.param];
            if (inputElement) {
              inputElement.setCustomValidity(current.msg);
            }
          }
          return acc;
        }, {});
        setFieldErrors(apiFieldErrors);
        setError(err.response.data.message || 'Please correct the highlighted fields.');
        form.reportValidity();
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      accountNumber: '',
      nationalId: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
    setFieldErrors({});
  };

  const buttonEffect = {
    onMouseOver: (e) => { e.target.style.backgroundColor = PRIMARY_COLOR; e.target.style.color = 'white'; },
    onMouseOut: (e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = PRIMARY_COLOR; },
    onFocus: (e) => { e.target.style.backgroundColor = PRIMARY_COLOR; e.target.style.color = 'white'; },
    onBlur: (e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = PRIMARY_COLOR; },
    onMouseDown: (e) => e.target.style.transform = 'scale(0.99)',
    onMouseUp: (e) => e.target.style.transform = 'scale(1)'
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      backgroundImage: `linear-gradient(135deg, rgba(17, 17, 35, 0.9), rgba(17, 17, 35, 0.85)), url(${cityscapeImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: 'white',
    }}>
      {/* LEFT SIDE: Branding Panel */}
      <div style={{
        flex: 1.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `linear-gradient(135deg, rgba(39, 30, 90, 0.82), rgba(25, 19, 58, 0.88)), url(${abstractImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
        opacity: 0,
        animation: 'fadeInLeft 1.3s ease-out forwards'
      }}>
        <div style={{
          position: 'absolute',
          width: '550px',
          height: '550px',
          backgroundImage: `linear-gradient(135deg, rgba(173, 216, 230, 0.45), rgba(135, 206, 235, 0.35)), url(${cityscapeImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '45% 55% 65% 35% / 55% 45% 55% 45%',
          top: '-15%',
          right: '55%',
          transform: 'rotate(-30deg)',
          filter: 'blur(120px)',
          opacity: 0,
          animation: 'fadeIn 2.2s ease-out forwards, moveShape1 20s infinite alternate ease-in-out'
        }}></div>

        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          backgroundImage: `linear-gradient(45deg, rgba(255, 105, 180, 0.45), rgba(147, 112, 219, 0.35)), url(${abstractImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '65% 35% 40% 60% / 65% 35% 55% 45%',
          bottom: '5%',
          left: '15%',
          transform: 'rotate(25deg)',
          filter: 'blur(110px)',
          opacity: 0,
          animation: 'fadeIn 2.2s ease-out forwards, moveShape2 25s infinite alternate ease-in-out'
        }}></div>

        <h2 style={{
          fontSize: '3.2em',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.6)',
          zIndex: 1,
          fontWeight: 900,
          opacity: 0,
          animation: 'fadeInUp 1.6s ease-out forwards'
        }}>
          Start Your Journey
        </h2>
        <p style={{
          fontSize: '1.6em',
          marginTop: '10px',
          zIndex: 1,
          opacity: 0,
          animation: 'fadeInUp 1.7s ease-out forwards'
        }}>
          Open Your Secure Account Today
        </p>
      </div>

      {/* RIGHT SIDE: Registration Form */}
      <div style={{
        flex: 1.5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        minWidth: '350px',
        maxWidth: '650px',
        backgroundImage: `linear-gradient(315deg, rgba(17, 17, 35, 0.88), rgba(39, 30, 90, 0.85)), url(${abstractImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
        opacity: 0,
        animation: 'fadeInRight 1.3s ease-out forwards'
      }}>
        <div style={{
          position: 'absolute',
          width: '550px',
          height: '550px',
          backgroundImage: `linear-gradient(315deg, rgba(173, 216, 230, 0.45), rgba(135, 206, 235, 0.35)), url(${cityscapeImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '45% 55% 65% 35% / 55% 45% 55% 45%',
          top: '65%',
          left: '70%',
          transform: 'rotate(150deg)',
          filter: 'blur(120px)',
          opacity: 0,
          animation: 'fadeIn 2.2s ease-out forwards, moveShape1Left 20s infinite alternate ease-in-out'
        }}></div>

        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          backgroundImage: `linear-gradient(225deg, rgba(255, 105, 180, 0.45), rgba(147, 112, 219, 0.35)), url(${abstractImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '65% 35% 40% 60% / 65% 35% 55% 45%',
          bottom: '75%',
          right: '80%',
          transform: 'rotate(10deg)',
          filter: 'blur(110px)',
          opacity: 0,
          animation: 'fadeIn 2.2s ease-out forwards, moveShape2Left 25s infinite alternate ease-in-out'
        }}></div>

        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          color: DARK_TEXT,
          zIndex: 2,
          position: 'relative',
          opacity: 0,
          animation: 'fadeInUp 1.5s ease-out forwards'
        }}>
          <div style={{
            color: PRIMARY_COLOR,
            paddingBottom: '20px',
            marginBottom: '20px',
            borderBottom: '1px solid #E5E7EB',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '2.5em', fontWeight: 900 }}>Create Account</h1>
            <p style={{ color: '#6B7280' }}>Join our secure platform</p>
          </div>

          <form onSubmit={handleRegister}>
            {[
              { name: 'fullName', label: 'Full Name', placeholder: 'Enter your full name', type: 'text', autoComplete: 'name' },
              { name: 'accountNumber', label: 'Account Number', placeholder: '10-digit Account number', type: 'text', autoComplete: 'off', inputMode: 'numeric', maxLength: 10 },
              { name: 'nationalId', label: 'National ID Number', placeholder: '13-digit National ID number', type: 'text', autoComplete: 'off', inputMode: 'numeric', maxLength: 13 },
              { name: 'password', label: 'Password', placeholder: 'Choose a strong password', type: 'password', autoComplete: 'new-password' },
              { name: 'confirmPassword', label: 'Confirm Password', placeholder: 'Confirm your password', type: 'password', autoComplete: 'new-password' }
            ].map(({ name, label, placeholder, type, autoComplete, inputMode, maxLength }) => (
              <div key={name} style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: DARK_TEXT }}>
                  {label}:
                </label>
                <input
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  value={formData[name]}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  disabled={loading}
                  autoComplete={autoComplete}
                  inputMode={inputMode}
                  maxLength={maxLength}
                  aria-invalid={Boolean(fieldErrors[name])}
                  aria-describedby={fieldErrors[name] ? `${name}-error` : undefined}
                />
                {fieldErrors[name] && (
                  <div
                    id={`${name}-error`}
                    style={{
                      color: '#EF4444',
                      marginTop: '8px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    {fieldErrors[name]}
                  </div>
                )}
              </div>
            ))}

            {error && (
              <div style={{
                color: '#EF4444',
                textAlign: 'center',
                marginBottom: '15px',
                fontWeight: 'bold',
                border: '1px solid #FCA5A5',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px',
                  backgroundColor: loading ? '#9CA3AF' : BUTTON_COLOR,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  boxShadow: `0 4px 10px rgba(79, 70, 229, 0.5)`
                }}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '14px',
                  backgroundColor: '#E5E7EB',
                  color: DARK_TEXT,
                  border: '1px solid #D1D5DB',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                Reset Form
              </button>
            </div>
          </form>

          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            paddingTop: '25px',
            borderTop: '1px solid #E5E7EB'
          }}>
            <p style={{ color: '#6B7280', marginBottom: '15px' }}>Already have an account?</p>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 25px',
                backgroundColor: 'transparent',
                color: PRIMARY_COLOR,
                border: `2px solid ${PRIMARY_COLOR}`,
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
              {...buttonEffect}
            >
              Login Here
            </button>
          </div>
        </div>

        <style>
          {`
            @keyframes fadeIn {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            @keyframes fadeInUp {
              0% { opacity: 0; transform: translateY(20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes fadeInLeft {
              0% { opacity: 0; transform: translateX(-30px); }
              100% { opacity: 1; transform: translateX(0); }
            }
            @keyframes fadeInRight {
              0% { opacity: 0; transform: translateX(30px); }
              100% { opacity: 1; transform: translateX(0); }
            }
            @keyframes moveShape1 {
              0% { transform: translate(0, 0) rotate(-30deg); }
              100% { transform: translate(80px, -80px) rotate(-40deg); }
            }
            @keyframes moveShape2 {
              0% { transform: translate(0, 0) rotate(25deg); }
              100% { transform: translate(-50px, 60px) rotate(35deg); }
            }
            @keyframes moveShape1Left {
              0% { transform: translate(0, 0) rotate(150deg); }
              100% { transform: translate(-80px, 80px) rotate(160deg); }
            }
            @keyframes moveShape2Left {
              0% { transform: translate(0, 0) rotate(10deg); }
              100% { transform: translate(50px, -60px) rotate(0deg); }
            }
          `}
        </style>
      </div>
    </div>
  );
}
