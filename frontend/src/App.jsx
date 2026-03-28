import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Architecture from './pages/Architecture';
import FAQ from './pages/FAQ';

// Dashboard Pages (Nested)
import DashboardLayout from './pages/Dashboard';
import LiveFeed from './pages/LiveFeed';
import AcousticHistory from './pages/AcousticHistory';
import MachineConfig from './pages/MachineConfig';

// Make sure the "export default" is right here!
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes (Nested Layout) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* If someone types /dashboard, redirect them to /dashboard/live */}
            <Route index element={<Navigate to="live" replace />} />
            
            {/* The actual dashboard sub-pages */}
            <Route path="live" element={<LiveFeed />} />
            <Route path="history" element={<AcousticHistory />} />
            <Route path="config" element={<MachineConfig />} />
          </Route>
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}