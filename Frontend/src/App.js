import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import CoverPage from './pages/CoverPage.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/HomeDashboard.jsx'
import PaymentPortal from './pages/PaymentPortal.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App() {
  return (
    <AuthProvider>
      {/* Navigation for applicarion*/}
      <Router>
        <Routes>
          <Route path="/" element={<CoverPage />} /> {/* (React Navigation, 2025) */}
          <Route path="/coverpage" element={<CoverPage />} /> {/* (React Navigation, 2025) */}
          <Route path="/register" element={<Register />} /> {/* (React Navigation, 2025) */}
          <Route path="/login" element={<Login />} /> {/* (React Navigation, 2025) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/paymentportal"
            element={
              <ProtectedRoute>
                <PaymentPortal />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
// React Navigation, 2025. Moving between screens. Available at: https://reactnavigation.org/docs/navigating/ [Accessed 10 October 2025].