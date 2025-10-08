import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    idNumber: '',
    accountNumber: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userData = {
        fullName: 'John Doe',
        idNumber: formData.idNumber,
        accountNumber: formData.accountNumber,
        balance: 125450.00
      };

      login(userData);
      navigate("/payments");
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleReset = () => {
    setFormData({
      idNumber: '',
      accountNumber: '',
      password: ''
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
          maxWidth: '520px',
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
            <h1>Welcome Back!</h1>
            <p style={{ color: '#666' }}>Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                ID Number:
              </label>
              <input
                type="text"
                name="idNumber"
                placeholder="Enter your ID number"
                value={formData.idNumber}
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

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                Password:
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
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
                Login
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
                Reset
              </button>
            </div>
          </form>

          <div style={{
            marginTop: '30px',
            textAlign: 'center',
            paddingTop: '25px',
            borderTop: '1px solid #eee'
          }}>
            <p style={{ color: '#666', marginBottom: '15px' }}>Don't have an account?</p>
            <button
              onClick={() => navigate('/register')}
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
              Register Now
            </button>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1.5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #6A0DAD 0%, #4A007F 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          top: '10%',
          left: '15%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(50px)'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          bottom: '15%',
          right: '10%',
          transform: 'translate(50%, 50%)',
          filter: 'blur(40px)'
        }}></div>
        <h2 style={{ fontSize: '3em', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', zIndex: 1 }}>
          Secure Banking at Your Fingertips
        </h2>
      </div>
    </div>
  );
}
