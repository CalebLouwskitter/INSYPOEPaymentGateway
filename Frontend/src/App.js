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
      <Router>
        <Routes>
          <Route path="/" element={<CoverPage />} />
          <Route path="/coverpage" element={<CoverPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/paymentportal" element={<PaymentPortal />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;