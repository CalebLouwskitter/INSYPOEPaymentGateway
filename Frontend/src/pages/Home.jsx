import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{
        backgroundColor: '#4F46E5',
        color: 'white',
        padding: '40px',
        borderRadius: '8px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '48px' }}>💳 SecurePay</h1>
        <p style={{ margin: '0', fontSize: '20px' }}>
          Your Trusted International Payment Platform
        </p>
      </div>

      <div style={{
        backgroundColor: '#f9f9f9',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        marginBottom: '20px'
      }}>
        <h2 style={{ marginTop: '0' }}>Welcome to SecurePay</h2>
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
          SecurePay provides secure, fast, and reliable international payment services. 
          Send money worldwide using SWIFT and other trusted payment providers.
        </p>
        
        <h3>Our Services:</h3>
        <ul style={{ fontSize: '16px', lineHeight: '1.8' }}>
          <li>🌍 International money transfers</li>
          <li>💱 Multi-currency support (ZAR, USD, EUR, GBP)</li>
          <li>🔒 Secure SWIFT payments</li>
          <li>📊 Real-time transaction tracking</li>
          <li>💼 Business and personal accounts</li>
        </ul>
      </div>

      <div style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        marginTop: '30px'
      }}>
        {!isAuthenticated ? (
          <>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '15px 30px',
                backgroundColor: '#4F46E5',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              Register Now
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '15px 30px',
                backgroundColor: 'white',
                color: '#4F46E5',
                border: '2px solid #4F46E5',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              Login
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/payments')}
            style={{
              padding: '15px 30px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            Go to Payment Dashboard
          </button>
        )}
      </div>

      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#FEF3C7',
        borderRadius: '8px',
        border: '1px solid #FCD34D'
      }}>
        <h3 style={{ marginTop: '0' }}>🔐 Security Notice</h3>
        <p style={{ margin: '0', fontSize: '14px' }}>
          SecurePay uses industry-standard encryption and security protocols to protect 
          your financial information. All transactions are verified and monitored for 
          suspicious activity.
        </p>
      </div>
    </div>
  );
}