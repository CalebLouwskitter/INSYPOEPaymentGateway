import { useState } from "react";
import { useNavigate } from "react-router-dom";

<<<<<<< Updated upstream
=======
// References:
// Meta Platforms, Inc. (2025) React - A JavaScript library for building user interfaces. Available at: https://reactjs.org/ (Accessed: 07 January 2025).
// Remix Software, Inc. (2025) React Router - Declarative routing for React. Available at: https://reactrouter.com/ (Accessed: 07 January 2025).

>>>>>>> Stashed changes
export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    console.log("✅ Registration Success:", formData);

<<<<<<< Updated upstream
=======
    // Navigate to login after successful registration
>>>>>>> Stashed changes
    navigate("/login");
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setError('');
  };

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

  const handleInputFocus = (e) => {
    e.target.style.borderColor = PRIMARY_COLOR;
    e.target.style.backgroundColor = 'white';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#D1D5DB';
    e.target.style.backgroundColor = '#F3F4F6';
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh', 
      fontFamily: 'Inter, sans-serif',
      backgroundColor: '#1e1933',
      color: 'white',
    }}>
      {/* LEFT SIDE: Branding Panel */}
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
          Start Your Journey
        </h2>
        <p style={{
            fontSize: '1.6em',
            marginTop: '10px',
            zIndex: 1
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
            <h1 style={{fontSize: '2.5em', fontWeight: 900}}>Create Account</h1>
            <p style={{ color: '#6B7280' }}>Join our secure platform</p>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleRegister}>
            {['fullName', 'email', 'password', 'confirmPassword'].map((field) => (
              <div key={field} style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  color: DARK_TEXT
                }}>
                  {field === 'fullName' ? 'Full Name:' :
                   field === 'email' ? 'Email Address:' :
                   field === 'password' ? 'Password:' : 'Confirm Password:'}
                </label>
                <input
                  type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                  name={field}
                  placeholder={
                    field === 'fullName' ? 'John Doe' :
                    field === 'email' ? 'you@example.com' :
                    field === 'password' ? 'Choose a strong password' : 'Confirm your password'
                  }
                  value={formData[field]}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
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
                style={{
                  padding: '14px',
                  backgroundColor: BUTTON_COLOR,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px', 
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  boxShadow: `0 4px 10px rgba(79, 70, 229, 0.5)`,
                  transition: 'background-color 0.3s ease, transform 0.1s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#4338CA'}
                onMouseOut={(e) => e.target.style.backgroundColor = BUTTON_COLOR}
              >
                Register
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
                  fontSize: '18px',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#D1D5DB'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#E5E7EB'}
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
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease, color 0.3s ease'
              }}
              onMouseOver={(e) => { e.target.style.backgroundColor = PRIMARY_COLOR; e.target.style.color = 'white'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = PRIMARY_COLOR; }}
            >
              Login Here
            </button>
          </div>
        </div>

        <style>
          {`
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
