import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    // Kick them back to login if no user is found
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the protected component (like the Dashboard)
  return children;
}