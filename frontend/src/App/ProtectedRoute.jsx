import { Navigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';

function ProtectedRoute({ children }) {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
