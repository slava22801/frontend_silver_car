import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { isAuthenticated, isAdmin } from '~/utils/auth';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin()) {
      navigate('/profile');
    }
  }, [navigate]);

  // Если пользователь не аутентифицирован, не показываем содержимое
  if (!isAuthenticated()) {
    return null;
  }

  // Если пользователь не администратор, не показываем содержимое
  if (!isAdmin()) {
    return null;
  }

  return <>{children}</>;
}

