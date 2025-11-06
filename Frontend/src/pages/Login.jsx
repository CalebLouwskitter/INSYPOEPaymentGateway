import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandButton from "../components/BrandButton";
import BrandShape from "../components/BrandShape";
import cityscapeImage from "../assets/pexels-anete-lusina-4792381.webp"; // (Lusina, 2025)
import abstractImage from "../assets/pexels-disha-sheta-596631-3521353.webp"; //(Sheta, 2025)
import "../styles/branding.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

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

  const authFields = [
    { name: 'fullName', label: 'Full Name', placeholder: 'Enter your full name', type: 'text', autoComplete: 'name' },
    { name: 'accountNumber', label: 'Account Number', placeholder: 'Enter your 10-digit account number', type: 'text', autoComplete: 'username', inputMode: 'numeric', maxLength: 10 },
    { name: 'nationalId', label: 'National ID Number', placeholder: 'Enter your 13-digit national ID', type: 'text', autoComplete: 'off', inputMode: 'numeric', maxLength: 13 },
    { name: 'password', label: 'Password', placeholder: 'Enter your password', type: 'password', autoComplete: 'current-password', spaced: true }
  ];

  // (W3Schools, 2025)
  return (
    <div
      className="brand-auth-page"
      style={{
        '--brand-page-image': `url(${cityscapeImage})`,
        '--brand-page-overlay': 'linear-gradient(135deg, rgba(17, 17, 35, 0.85), rgba(17, 17, 35, 0.9))',
      }}
    >
      <div
        className="brand-auth-panel"
        style={{
          '--brand-panel-image': `url(${abstractImage})`,
          '--brand-panel-overlay': 'linear-gradient(315deg, rgba(17, 17, 35, 0.88), rgba(39, 30, 90, 0.85))',
          '--brand-panel-animation': 'fadeInLeft 1.3s ease-out forwards',
        }}
      >
        <BrandShape
          width="550px"
          height="550px"
          gradient="linear-gradient(315deg, rgba(173, 216, 230, 0.45), rgba(135, 206, 235, 0.35))"
          image={`url(${cityscapeImage})`}
          top="65%"
          left="70%"
          transform="rotate(150deg)"
          motion="moveShape1Left 20s infinite alternate ease-in-out"
          blur="120px"
        />

        <BrandShape
          width="400px"
          height="400px"
          gradient="linear-gradient(225deg, rgba(255, 105, 180, 0.45), rgba(147, 112, 219, 0.35))"
          image={`url(${abstractImage})`}
          bottom="75%"
          right="80%"
          transform="rotate(10deg)"
          motion="moveShape2Left 25s infinite alternate ease-in-out"
          blur="110px"
        />

        <div className="brand-card">
          <div className="brand-auth-heading">
            <h1>Welcome Back!</h1>
            <p>Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            {authFields.map(({ name, label, placeholder, type, autoComplete, inputMode, maxLength, spaced }) => (
              <div
                key={name}
                className={`brand-form-field${spaced ? ' brand-form-field--spaced' : ''}`}
              >
                <label className="brand-form-label" htmlFor={name}>
                  {label}
                </label>
                <input
                  id={name}
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  value={formData[name]}
                  onChange={handleInputChange}
                  required
                  className="brand-input"
                  disabled={loading}
                  autoComplete={autoComplete}
                  inputMode={inputMode}
                  maxLength={maxLength}
                  aria-invalid={Boolean(fieldErrors[name])}
                  aria-describedby={fieldErrors[name] ? `${name}-error` : undefined}
                />
                {fieldErrors[name] && (
                  <div id={`${name}-error`} className="brand-error-text">
                    {fieldErrors[name]}
                  </div>
                )}
              </div>
            ))}

            {error && <div className="brand-error-box">{error}</div>}

            <div className="brand-button-stack">
              <BrandButton
                type="submit"
                disabled={loading}
                className={loading ? 'brand-button--muted' : ''}
              >
                {loading ? 'Logging in...' : 'Login'}
              </BrandButton>
              <BrandButton type="button" variant="muted" onClick={handleReset}>
                Reset
              </BrandButton>
            </div>
          </form>

          <div className="brand-link-group">
            <p className="brand-link-text">Don't have an account?</p>
            <BrandButton variant="outline" onClick={() => navigate('/register')}>
              Register Now
            </BrandButton>
          </div>

          {/* Employee Portal Link */}
          <div className="brand-link-group">
            <p className="brand-link-text">Employee Access</p>
            <BrandButton
              variant="employee"
              onClick={() => navigate('/employee/login')}
            >
              <span role="img" aria-label="Employee">
                👨‍💼
              </span>{' '}
              Employee Portal
            </BrandButton>
          </div>
        </div>
      </div>

      {/* Branding panel (right side) */}
      <div
        className="brand-auth-panel brand-auth-panel--brand"
        style={{
          '--brand-panel-image': `url(${abstractImage})`,
          '--brand-panel-overlay': 'linear-gradient(135deg, rgba(39, 30, 90, 0.85), rgba(25, 19, 58, 0.88))',
          '--brand-panel-animation': 'fadeInRight 1.3s ease-out forwards',
        }}
      >
        <BrandShape
          width="550px"
          height="550px"
          gradient="linear-gradient(135deg, rgba(173, 216, 230, 0.45), rgba(135, 206, 235, 0.35))"
          image={`url(${cityscapeImage})`}
          top="-15%"
          right="55%"
          transform="rotate(-30deg)"
          motion="moveShape1 20s infinite alternate ease-in-out"
          blur="120px"
        />

        <BrandShape
          width="400px"
          height="400px"
          gradient="linear-gradient(45deg, rgba(255, 105, 180, 0.45), rgba(147, 112, 219, 0.35))"
          image={`url(${abstractImage})`}
          bottom="5%"
          left="15%"
          transform="rotate(25deg)"
          motion="moveShape2 25s infinite alternate ease-in-out"
          blur="110px"
        />

        <h2
          style={{
            fontSize: '3.2em',
            textShadow: '0 0 20px rgba(255, 255, 255, 0.6)',
            zIndex: 1,
            fontWeight: 900,
            opacity: 0,
            animation: 'fadeInUp 1.6s ease-out forwards',
          }}
        >
          Secure Banking
        </h2>
        <p
          style={{
            fontSize: '1.6em',
            marginTop: '10px',
            zIndex: 1,
            opacity: 0,
            animation: 'fadeInUp 1.7s ease-out forwards',
          }}
        >
          Access Your Finances Easily
        </p>
      </div>
    </div>
  );
}

//Sheta, D. 2025. Seven Indian rupee banknotes hanging from clothesline on clothes pegs [Photograph]. Pexels. Available at: https://www.pexels.com/photo/seven-indian-rupee-banknotes-hanging-from-clothesline-on-clothes-pegs-3521353/ (Accessed: 10 October 2025)
//Lusina, A. 2025. Person picking fake Monopoly money [Photograph]. Pexels. Available at: https://www.pexels.com/photo/person-picking-fake-monopoly-money-4792381/ (Accessed: 10 October 2025).
// W3Schools, 2025. Styling React Using CSS. Available at: https://www.w3schools.com/react/react_css.asp [Accessed 10 October 2025].