// calling in the required imports to handle routing between multiple pages
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// call in our pages
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PaymentDashboard from './pages/PaymentDashboard.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

function App() {
  return (
    /* wrap everything in AuthProvider so auth state is available everywhere */
    <AuthProvider>
      {/* the router is the main thing that handles our routing needs */}
      <Router>
        {/* we then specify that we have MULTIPLE routes */}
        <Routes>
          {/* each route has a path (where it lives), and an element (what page it relates to) */}
          <Route path="/" element={<Home/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login/>}/>
          {/* because dashboard is now wrapped in ProtectedRoute, authentication will be checked in order
          to navigate there */ }
          <Route path="/dashboard" element={<ProtectedRoute> <Dashboard/> </ProtectedRoute>}/>
          <Route path="/payments" element={<ProtectedRoute> <PaymentDashboard/> </ProtectedRoute>}/>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App