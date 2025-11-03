import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BrandButton from '../components/BrandButton.jsx';
import cityscapeImage from '../assets/pexels-anete-lusina-4792381.webp'; // (Lusina, 2025)
import abstractImage from '../assets/pexels-disha-sheta-596631-3521353.webp'; //(Sheta, 2025)
import '../styles/branding.css';

export default function CoverPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Automatically redirect to the dashboard if the user is already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  //(W3Schools, 2025)
  return ( 
    <div
      className="brand-cover-page"
      style={{
        '--brand-page-image': `url(${cityscapeImage})`,
        '--brand-page-overlay': 'linear-gradient(135deg, rgba(17, 17, 35, 0.85), rgba(17, 17, 35, 0.85))',
      }}
    >
      {/* Animated Shapes */}
      <div
        className="brand-shape"
        style={{
          '--brand-shape-width': '600px',
          '--brand-shape-height': '600px',
          '--brand-shape-gradient': 'linear-gradient(135deg, rgba(173,216,230,0.55), rgba(135,206,235,0.35))',
          '--brand-shape-image': `url(${abstractImage})`,
          '--brand-shape-top': '-20%',
          '--brand-shape-left': '-15%',
          '--brand-shape-blur': '150px',
          '--brand-shape-motion': 'moveShape1 20s infinite alternate ease-in-out',
        }}
      ></div>

      <div
        className="brand-shape"
        style={{
          '--brand-shape-width': '500px',
          '--brand-shape-height': '500px',
          '--brand-shape-gradient': 'linear-gradient(225deg, rgba(255,105,180,0.6), rgba(147,112,219,0.45))',
          '--brand-shape-image': `url(${abstractImage})`,
          '--brand-shape-bottom': '-15%',
          '--brand-shape-right': '-10%',
          '--brand-shape-blur': '140px',
          '--brand-shape-motion': 'moveShape2 25s infinite alternate ease-in-out',
        }}
      ></div>

      {/* Main Content */}
      <div className="brand-card brand-card--glass brand-cover-content">
        <h1 className="brand-headline">Welcome to Macsaton</h1>
        <p className="brand-subheadline">
          Your gateway to seamless banking and financial management.
        </p>

        <div className="brand-button-row">
          <BrandButton onClick={() => navigate('/login')}>
            Login
          </BrandButton>
          <BrandButton variant="outline" onClick={() => navigate('/register')}>
            Register
          </BrandButton>
        </div>

        {/* Employee Portal Link */}
        <div className="brand-link-group brand-section-divider--dark">
          <p className="brand-link-text--muted">Are you an employee?</p>
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
  );
}

//Sheta, D. 2025. Seven Indian rupee banknotes hanging from clothesline on clothes pegs [Photograph]. Pexels. Available at: https://www.pexels.com/photo/seven-indian-rupee-banknotes-hanging-from-clothesline-on-clothes-pegs-3521353/ (Accessed: 10 October 2025)
//Lusina, A. 2025. Person picking fake Monopoly money [Photograph]. Pexels. Available at: https://www.pexels.com/photo/person-picking-fake-monopoly-money-4792381/ (Accessed: 10 October 2025).
// W3Schools, 2025. Styling React Using CSS. Available at: https://www.w3schools.com/react/react_css.asp [Accessed 10 October 2025].