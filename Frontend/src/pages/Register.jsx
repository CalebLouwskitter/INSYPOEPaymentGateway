import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    accountNumber: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const showMessage = (message) => {
      console.log(message);
      if (message.includes('successful')) {
        navigate('/login');
      }
    };

    if (formData.password !== formData.confirmPassword) {
      showMessage('Passwords do not match!');
      return;
    }

    if (formData.idNumber.length !== 13 || !/^\d{13}$/.test(formData.idNumber)) {
      showMessage('ID number must be 13 digits!');
      return;
    }

    try {
      showMessage('Registration successful! Redirecting to login...');
    } catch (error) {
      showMessage('Registration failed. Please try again.');
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      idNumber: '',
      accountNumber: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#6A0DAD',
      color: 'white',
    }}>
      <div style={{
        flex: 1.5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #6A0DAD 0%, #4A007F 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px'
      }}>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          top: '15%',
          right: '10%',
          transform: 'translate(50%, -50%)',
          filter: 'blur(50px)'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          bottom: '20%',
          left: '15%',
          transform: 'translate(-50%, 50%)',
          filter: 'blur(40px)'
        }}></div>
        <h2 style={{ fontSize: '3em', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', zIndex: 1, textAlign: 'center' }}>
          Join Us Today and Start Banking Better
        </h2>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        minWidth: '350px',
        maxWidth: '650px',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '580px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          color: '#333'
        }}>
          <div style={{
            color: '#4F46E5',
            paddingBottom: '20px',
            marginBottom: '20px',
            borderBottom: '1px solid #eee',
            textAlign: 'center'
          }}>
            <h1>Sign Up</h1>
            <p style={{ color: '#666' }}>Create your new customer account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Full Name:
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                ID Number (13 Digits):
              </label>
              <input
                type="text"
                name="idNumber"
                placeholder="13-digit ID number"
                value={formData.idNumber}
                onChange={handleInputChange}
                required
                maxLength="13"
                pattern="\d{13}"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Account Number:
              </label>
              <input
                type="text"
                name="accountNumber"
                placeholder="Enter account number"
                value={formData.accountNumber}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Password:
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Confirm Password:
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                minLength="6"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button
                type="submit"
                style={{
                  padding: '14px',
                  backgroundColor: '#4F46E5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#4338CA'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4F46E5'}
              >
                Register Account
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '14px',
                  backgroundColor: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#5A606A'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6B7280'}
              >
                Reset Form
              </button>
            </div>
          </form>

          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            paddingTop: '25px',
            borderTop: '1px solid #eee'
          }}>
            <p style={{ color: '#666', marginBottom: '15px' }}>Already have an account?</p>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 25px',
                backgroundColor: 'white',
                color: '#4F46E5',
                border: '2px solid #4F46E5',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease, color 0.3s ease'
              }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#4F46E5'; e.target.style.color = 'white'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = 'white'; e.target.style.color = '#4F46E5'; }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
