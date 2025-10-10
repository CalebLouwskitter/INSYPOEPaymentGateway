import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import cityscapeImage from "../assets/pexels-anete-lusina-4792381.webp"; // (Lusina, 2025)
import abstractImage from "../assets/pexels-disha-sheta-596631-3521353.webp"; //(Sheta, 2025)

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Theme colors
  const PRIMARY_COLOR = '#8B5CF6';
  const BUTTON_COLOR = '#4F46E5';
  const DARK_TEXT = '#1F2937';

  // Common style for input fields
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
    fullName: '',
    accountNumber: '',
    nationalId: '',
    password: ''
  });

  const [error, setError] = useState(''); // General error message
  const [loading, setLoading] = useState(false); // Login loading state
  const [fieldErrors, setFieldErrors] = useState({}); // Field-specific validation errors

  // Update form state and sanitize inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value.replace(/[<>]/g, ""); // Remove potentially harmful characters

    if (name === 'accountNumber') {
      sanitizedValue = sanitizedValue.replace(/\D/g, "").slice(0, 10); // Only digits, max 10
    }

    if (name === 'nationalId') {
      sanitizedValue = sanitizedValue.replace(/\D/g, "").slice(0, 13); // Only digits, max 13
    }

    if (name === 'fullName') {
      sanitizedValue = sanitizedValue.replace(/[^a-zA-Z\s'-]/g, ""); // Only letters, spaces, hyphen, apostrophe
    }

    setFormData({ ...formData, [name]: sanitizedValue });
    e.target.setCustomValidity('');
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  // Redirect to dashboard if already authenticated
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

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fullNameInput = form.elements.fullName;
    const accountInput = form.elements.accountNumber;
    const nationalIdInput = form.elements.nationalId;
    const passwordInput = form.elements.password;

    // Reset previous messages
    fullNameInput.setCustomValidity("");
    accountInput.setCustomValidity("");
    nationalIdInput.setCustomValidity("");
    passwordInput.setCustomValidity("");

    const validationErrors = {};

    // Validate full name
    if (!/^[a-zA-Z\s]{3,}$/.test(formData.fullName)) {
      const message = "Please enter a valid full name.";
      fullNameInput.setCustomValidity(message);
      validationErrors.fullName = message;
    }

    // Custom validity messages for account number
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

    if (!formData.password) {
      const message = "Password is required.";
      passwordInput.setCustomValidity(message);
      validationErrors.password = message;
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
      // Use context login which handles API call and state
      const response = await login({
        fullName: formData.fullName,
        accountNumber: formData.accountNumber,
        nationalId: formData.nationalId,
        password: formData.password,
      });

      console.log('Login Success:', response?.data);

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      
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
        setError("Login failed. Please try again.");
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
      password: ''
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

  // (W3Schools, 2025)
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif',
      backgroundImage: `linear-gradient(135deg, rgba(17, 17, 35, 0.85), rgba(17, 17, 35, 0.9)), url(${cityscapeImage})`, // (Lusina, 2025)
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: 'white',
    }}>
      <div style={{
        flex: 1.5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        minWidth: '350px',
        maxWidth: '650px',
        backgroundImage: `linear-gradient(315deg, rgba(17, 17, 35, 0.88), rgba(39, 30, 90, 0.85)), url(${abstractImage})`, //(Sheta, 2025)
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
          backgroundImage: `linear-gradient(315deg, rgba(173, 216, 230, 0.45), rgba(135, 206, 235, 0.35)), url(${cityscapeImage})`, // (Lusina, 2025)
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '45% 55% 65% 35% / 55% 45% 55% 45%',
          top: '65%',
          left: '70%',
          transform: 'rotate(150deg)',
          filter: 'blur(120px)',
          opacity: 0,
          animation: 'fadeIn 2.1s ease-out forwards, moveShape1Left 20s infinite alternate ease-in-out'
        }}></div>

        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          backgroundImage: `linear-gradient(225deg, rgba(255, 105, 180, 0.45), rgba(147, 112, 219, 0.35)), url(${abstractImage})`, //(Sheta, 2025)
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '65% 35% 40% 60% / 65% 35% 55% 45%',
          bottom: '75%',
          right: '80%',
          transform: 'rotate(10deg)',
          filter: 'blur(110px)',
          opacity: 0,
          animation: 'fadeIn 2.1s ease-out forwards, moveShape2Left 25s infinite alternate ease-in-out'
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
            <h1 style={{ fontSize: '2.5em', fontWeight: 900 }}>Welcome Back!</h1>
            <p style={{ color: '#6B7280' }}>Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            {[ 
              { name: 'fullName', label: 'Full Name', placeholder: 'Enter your full name', type: 'text', autoComplete: 'name' },
              { name: 'accountNumber', label: 'Account Number', placeholder: 'Enter your 10-digit account number', type: 'text', autoComplete: 'username', inputMode: 'numeric', maxLength: 10 },
              { name: 'nationalId', label: 'National ID Number', placeholder: 'Enter your 13-digit national ID', type: 'text', autoComplete: 'off', inputMode: 'numeric', maxLength: 13 },
              { name: 'password', label: 'Password', placeholder: 'Enter your password', type: 'password', autoComplete: 'current-password' }
            ].map(({ name, label, placeholder, type, autoComplete, inputMode, maxLength }) => (
              <div key={name} style={{ marginBottom: name === 'password' ? '30px' : '20px' }}>
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
                onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#4338CA')}
                onMouseOut={(e) => !loading && (e.target.style.backgroundColor = BUTTON_COLOR)}
                onFocus={(e) => !loading && (e.target.style.backgroundColor = '#4338CA')}
                onBlur={(e) => !loading && (e.target.style.backgroundColor = BUTTON_COLOR)}
                onMouseDown={(e) => !loading && (e.target.style.transform = 'scale(0.99)')}
                onMouseUp={(e) => !loading && (e.target.style.transform = 'scale(1)')}
              >
                {loading ? 'Logging in...' : 'Login'}
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
                Reset
              </button>
            </div>
          </form>

          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            paddingTop: '25px',
            borderTop: '1px solid #E5E7EB'
          }}>
            <p style={{ color: '#6B7280', marginBottom: '15px' }}>Don't have an account?</p>
            <button
              onClick={() => navigate('/register')}
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
              Register Now
            </button>
          </div>
        </div>
      </div>

      {/* Branding panel (right side) */}
      <div style={{
        flex: 1.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `linear-gradient(135deg, rgba(39, 30, 90, 0.85), rgba(25, 19, 58, 0.88)), url(${abstractImage})`, //(Sheta, 2025)
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.45)',
        opacity: 0,
        animation: 'fadeInRight 1.3s ease-out forwards'
      }}>
        <div style={{
          position: 'absolute',
          width: '550px',
          height: '550px',
          backgroundImage: `linear-gradient(135deg, rgba(173, 216, 230, 0.45), rgba(135, 206, 235, 0.35)), url(${cityscapeImage})`, // (Lusina, 2025)
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '45% 55% 65% 35% / 55% 45% 55% 45%',
          top: '-15%',
          right: '55%',
          transform: 'rotate(-30deg)',
          filter: 'blur(120px)',
          opacity: 0,
          animation: 'fadeIn 2.1s ease-out forwards, moveShape1 20s infinite alternate ease-in-out'
        }}></div>

        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          backgroundImage: `linear-gradient(45deg, rgba(255, 105, 180, 0.45), rgba(147, 112, 219, 0.35)), url(${abstractImage})`, //(Sheta, 2025)
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '65% 35% 40% 60% / 65% 35% 55% 45%',
          bottom: '5%',
          left: '15%',
          transform: 'rotate(25deg)',
          filter: 'blur(110px)',
          opacity: 0,
          animation: 'fadeIn 2.1s ease-out forwards, moveShape2 25s infinite alternate ease-in-out'
        }}></div>

        <h2 style={{
          fontSize: '3.2em',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.6)',
          zIndex: 1,
          fontWeight: 900,
          opacity: 0,
          animation: 'fadeInUp 1.6s ease-out forwards'
        }}>
          Secure Banking
        </h2>
        <p style={{
          fontSize: '1.6em',
          marginTop: '10px',
          zIndex: 1,
          opacity: 0,
          animation: 'fadeInUp 1.7s ease-out forwards'
        }}>
          Access Your Finances Easily
        </p>
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
          @keyframes moveShape1Left {
            0% { transform: translate(0, 0) rotate(150deg); }
            100% { transform: translate(-80px, 80px) rotate(160deg); }
          }
          @keyframes moveShape2Left {
            0% { transform: translate(0, 0) rotate(10deg); }
            100% { transform: translate(50px, -60px) rotate(0deg); }
          }
          @keyframes moveShape1 {
            0% { transform: translate(0,0) rotate(-30deg); }
            100% { transform: translate(80px, -80px) rotate(-40deg); }
          }
          @keyframes moveShape2 {
            0% { transform: translate(0,0) rotate(25deg); }
            100% { transform: translate(-50px, 60px) rotate(35deg); }
          }
        `}
      </style>
    </div>
  );
}

//Sheta, D. 2025. Seven Indian rupee banknotes hanging from clothesline on clothes pegs [Photograph]. Pexels. Available at: https://www.pexels.com/photo/seven-indian-rupee-banknotes-hanging-from-clothesline-on-clothes-pegs-3521353/ (Accessed: 10 October 2025)
//Lusina, A. 2025. Person picking fake Monopoly money [Photograph]. Pexels. Available at: https://www.pexels.com/photo/person-picking-fake-monopoly-money-4792381/ (Accessed: 10 October 2025).
// W3Schools, 2025. Styling React Using CSS. Available at: https://www.w3schools.com/react/react_css.asp [Accessed 10 October 2025].