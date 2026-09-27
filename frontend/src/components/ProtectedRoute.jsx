import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function GuestRoute() {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <Outlet />;
}