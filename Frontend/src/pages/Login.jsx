import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // state to hold login form data
  const [formData, setFormData] = useState({
    username: '',
    accountNumber: '',
    password: ''
  });

  // handle input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // in a real app, you would validate credentials with your API
    // for now, we'll simulate a successful login
    try {
      // TODO: Replace with actual API call
      // const response = await loginUser(formData);
      
      // simulate user data - in reality this would come from your API
      const userData = {
        fullName: formData.username,
        idNumber: '1234567890123', // would come from API
        accountNumber: formData.accountNumber,
        balance: 125450.00 // would come from API
      };

      login(userData);
      navigate("/payments");
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleReset = () => {
    setFormData({
      username: '',
      accountNumber: '',
      password: ''
    });
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '500px', 
      margin: '50px auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#4F46E5',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1>💳 Customer Login</h1>
      </div>

      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Username:
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
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
                padding: '10px',
                fontSize: '16px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
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
                padding: '10px',
                fontSize: '16px',
                borderRadius: '5px',
                border: '1px solid #ccc'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#6B7280',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Reset
            </button>
          </div>
        </form>

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #ddd'
        }}>
          <p>Don't have an account?</p>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '10px 20px',
              backgroundColor: 'white',
              color: '#4F46E5',
              border: '2px solid #4F46E5',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}