import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    idNumber: '',
    accountNumber: '',
    password: ''
  });

  const [error, setError] = useState('');

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
    setFormData({ ...formData, [name]: value });
    setError('');
    e.target.setCustomValidity('');
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = PRIMARY_COLOR;
    e.target.style.backgroundColor = 'white';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#D1D5DB';
    e.target.style.backgroundColor = '#F3F4F6';
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const form = e.target;
    const idInput = form.elements.idNumber;
    const accountInput = form.elements.accountNumber;

    // Reset previous messages
    idInput.setCustomValidity("");
    accountInput.setCustomValidity("");

    // Check length
    if (!/^\d{13}$/.test(formData.idNumber)) {
      idInput.setCustomValidity("Please enter exactly 13 digits for your ID Number.");
      form.reportValidity();
      return;
    }
    if (!/^\d{10}$/.test(formData.accountNumber)) {
      accountInput.setCustomValidity("Please enter exactly 10 digits for your Account Number.");
      form.reportValidity();
      return;
    }

    // Check credentials via AuthContext
    const success = login(formData);
    if (success) {
      navigate("/paymentportal"); // go to Payment Portal if login correct
    } else {
      setError("Invalid credentials. Please check your ID, account number, and password.");
    }
  };

  const handleReset = () => {
    setFormData({
      idNumber: '',
      accountNumber: '',
      password: ''
    });
    setError('');
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
      backgroundColor: '#1e1933',
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
        background: 'linear-gradient(315deg, #1a0f3d 0%, #3f2f70 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          position: 'absolute',
          width: '550px',
          height: '550px',
          background: 'linear-gradient(315deg, rgba(173, 216, 230, 0.6), rgba(135, 206, 235, 0.4))',
          borderRadius: '45% 55% 65% 35% / 55% 45% 55% 45%',
          top: '65%',
          left: '70%',
          transform: 'rotate(150deg)',
          filter: 'blur(120px) opacity(0.8)',
          animation: 'moveShape1Left 20s infinite alternate ease-in-out'
        }}></div>

        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'linear-gradient(225deg, rgba(255, 105, 180, 0.7), rgba(147, 112, 219, 0.5))',
          borderRadius: '65% 35% 40% 60% / 65% 35% 55% 45%',
          bottom: '75%',
          right: '80%',
          transform: 'rotate(10deg)',
          filter: 'blur(110px) opacity(0.9)',
          animation: 'moveShape2Left 25s infinite alternate ease-in-out'
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
          position: 'relative'
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
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: DARK_TEXT }}>
                ID Number:
              </label>
              <input
                type="text"
                name="idNumber"
                placeholder="Enter your 13-digit ID number"
                value={formData.idNumber}
                onChange={handleInputChange}
                required
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: DARK_TEXT }}>
                Account Number:
              </label>
              <input
                type="text"
                name="accountNumber"
                placeholder="Enter your 10-digit account number"
                value={formData.accountNumber}
                onChange={handleInputChange}
                required
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: DARK_TEXT }}>
                Password:
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

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
                style={{
                  padding: '14px',
                  backgroundColor: BUTTON_COLOR,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  boxShadow: `0 4px 10px rgba(79, 70, 229, 0.5)`
                }}
              >
                Login
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
        background: 'linear-gradient(135deg, #1a0f3d 0%, #3f2f70 100%)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          position: 'absolute',
          width: '550px',
          height: '550px',
          background: 'linear-gradient(135deg, rgba(173, 216, 230, 0.6), rgba(135, 206, 235, 0.4))',
          borderRadius: '45% 55% 65% 35% / 55% 45% 55% 45%',
          top: '-15%',
          right: '55%',
          transform: 'rotate(-30deg)',
          filter: 'blur(120px) opacity(0.8)',
          animation: 'moveShape1 20s infinite alternate ease-in-out'
        }}></div>

        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'linear-gradient(45deg, rgba(255, 105, 180, 0.7), rgba(147, 112, 219, 0.5))',
          borderRadius: '65% 35% 40% 60% / 65% 35% 55% 45%',
          bottom: '5%',
          left: '15%',
          transform: 'rotate(25deg)',
          filter: 'blur(110px) opacity(0.9)',
          animation: 'moveShape2 25s infinite alternate ease-in-out'
        }}></div>

        <h2 style={{
          fontSize: '3.2em',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.6)',
          zIndex: 1,
          fontWeight: 900
        }}>
          Secure Banking
        </h2>
        <p style={{
          fontSize: '1.6em',
          marginTop: '10px',
          zIndex: 1
        }}>
          Access Your Finances Easily
        </p>
      </div>
    </div>
  );
}
