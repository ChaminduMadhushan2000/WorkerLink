import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: Array<'customer' | 'contractor' | 'admin'>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps): JSX.Element {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role as 'customer' | 'contractor' | 'admin')) {
    const redirects: Record<string, string> = {
      customer: '/customer/dashboard',
      contractor: '/contractor/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={redirects[user.role] ?? '/'} replace />;
  }

  return children;
}
