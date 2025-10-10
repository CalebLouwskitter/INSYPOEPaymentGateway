import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import cityscapeImage from '../assets/pexels-anete-lusina-4792381.webp'; // (Lusina, 2025)
import abstractImage from '../assets/pexels-disha-sheta-596631-3521353.webp'; //(Sheta, 2025)

export default function CoverPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Define main brand colors
  const PRIMARY_COLOR = '#8B5CF6';
  const BUTTON_COLOR = '#4F46E5';

  // Automatically redirect to the dashboard if the user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Inter, sans-serif',
      backgroundImage: `linear-gradient(135deg, rgba(17, 17, 35, 0.85), rgba(17, 17, 35, 0.85)), url(${cityscapeImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Shapes */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        backgroundImage: `linear-gradient(135deg, rgba(173,216,230,0.55), rgba(135,206,235,0.35)), url(${abstractImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '45% 55% 65% 35% / 55% 45% 55% 45%',
        top: '-20%',
        left: '-15%',
        filter: 'blur(150px)',
        opacity: 0,
        animation: 'fadeIn 2.4s ease-out forwards, moveShape1 20s infinite alternate ease-in-out'
      }}></div>

      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        backgroundImage: `linear-gradient(225deg, rgba(255,105,180,0.6), rgba(147,112,219,0.45)), url(${abstractImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '65% 35% 40% 60% / 65% 35% 55% 45%',
        bottom: '-15%',
        right: '-10%',
        filter: 'blur(140px)',
        opacity: 0,
        animation: 'fadeIn 2.4s ease-out forwards, moveShape2 25s infinite alternate ease-in-out'
      }}></div>

      {/* Main Content */}
      <div style={{
        zIndex: 1,
        textAlign: 'center',
        padding: '40px',
        borderRadius: '20px',
        backgroundColor: 'rgba(0,0,0,0.25)',
        backdropFilter: 'blur(10px)',
        maxWidth: '500px',
        width: '90%',
        opacity: 0,
        animation: 'fadeInUp 1.4s ease-out forwards'
      }}>
        <h1 style={{ fontSize: '3em', fontWeight: 900, marginBottom: '15px', color: PRIMARY_COLOR }}>
          Welcome to Macsaton
        </h1>
        <p style={{ fontSize: '1.5em', marginBottom: '40px', color: '#E5E7EB' }}>
          Your gateway to seamless banking and financial management.
          
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '16px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: BUTTON_COLOR,
              color: 'white',
              cursor: 'pointer',
              boxShadow: `0 4px 10px rgba(79,70,229,0.5)`,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4338CA'}
            onMouseOut={(e) => e.target.style.backgroundColor = BUTTON_COLOR}
            onFocus={(e) => e.target.style.backgroundColor = '#4338CA'}
            onBlur={(e) => e.target.style.backgroundColor = BUTTON_COLOR}
          >
            Login
          </button>

          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '16px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '10px',
              border: `2px solid ${PRIMARY_COLOR}`,
              backgroundColor: 'transparent',
              color: PRIMARY_COLOR,
              cursor: 'pointer',
              boxShadow: `0 4px 10px rgba(139,92,246,0.3)`,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = PRIMARY_COLOR;
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = PRIMARY_COLOR;
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = PRIMARY_COLOR;
              e.target.style.color = 'white';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = PRIMARY_COLOR;
            }}
          >
            Register
          </button>
        </div>
      </div>



      {/* Animation Keyframes */}
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(25px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes moveShape1 {
            0% { transform: translate(0,0) rotate(0deg); }
            50% { transform: translate(50px, -50px) rotate(20deg); }
            100% { transform: translate(0,0) rotate(0deg); }
          }
          @keyframes moveShape2 {
            0% { transform: translate(0,0) rotate(0deg); }
            50% { transform: translate(-40px, 60px) rotate(-25deg); }
            100% { transform: translate(0,0) rotate(0deg); }
          }
        `}
        
      </style>
    </div>
  );
}

//Sheta, D. 2025. Seven Indian rupee banknotes hanging from clothesline on clothes pegs [Photograph]. Pexels. Available at: https://www.pexels.com/photo/seven-indian-rupee-banknotes-hanging-from-clothesline-on-clothes-pegs-3521353/ (Accessed: 10 October 2025)
//Lusina, A. 2025. Person picking fake Monopoly money [Photograph]. Pexels. Available at: https://www.pexels.com/photo/person-picking-fake-monopoly-money-4792381/ (Accessed: 10 October 2025).