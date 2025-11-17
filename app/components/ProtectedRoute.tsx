import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { isAuthenticated } from '~/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Если пользователь не аутентифицирован, не показываем содержимое
  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}

