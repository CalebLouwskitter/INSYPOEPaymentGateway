import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from 'react';
import { AuthProvider } from "./context/AuthContext.jsx";
import { EmployeeAuthProvider } from "./context/EmployeeAuthContext.jsx";
import CoverPage from './pages/CoverPage.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/HomeDashboard.jsx'
import PaymentPortal from './pages/PaymentPortal.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import axiosInstance from './interfaces/axiosInstance';

// Employee portal imports
import EmployeeLogin from './pages/EmployeeLogin.jsx';
import EmployeeDashboard from './pages/EmployeeDashboard.jsx';
import PaymentHistory from './pages/PaymentHistory.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import EmployeeProtectedRoute from './components/EmployeeProtectedRoute.jsx';

function App() {
  useEffect(() => {
    axiosInstance.get('/csrf-token').catch(() => {});
  }, []);
  return (
    <AuthProvider>
      <EmployeeAuthProvider>
        {/* Navigation for application */}
        <Router>
          <Routes>
            {/* Customer Portal Routes */}
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

            {/* Employee Portal Routes */}
            <Route path="/employee/login" element={<EmployeeLogin />} />
            <Route
              path="/employee/dashboard"
              element={
                <EmployeeProtectedRoute>
                  <EmployeeDashboard />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="/employee/history"
              element={
                <EmployeeProtectedRoute>
                  <PaymentHistory />
                </EmployeeProtectedRoute>
              }
            />
            <Route
              path="/employee/admin"
              element={
                <EmployeeProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </EmployeeProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </EmployeeAuthProvider>
    </AuthProvider>
  );
}

export default App;
// React Navigation, 2025. Moving between screens. Available at: https://reactnavigation.org/docs/navigating/ [Accessed 10 October 2025].