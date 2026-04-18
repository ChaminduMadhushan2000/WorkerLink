import { Link } from 'react-router-dom';
import { Briefcase, Home } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

export function NotFound(): JSX.Element {
  const { user } = useAuthStore();

  const homeLink = user
    ? user.role === 'customer' ? '/customer/dashboard'
    : user.role === 'contractor' ? '/contractor/dashboard'
    : '/admin/dashboard'
    : '/';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="p-4 bg-white rounded-2xl shadow-card mb-6">
        <Briefcase size={40} className="text-navy-900" />
      </div>
      <h1 className="font-display font-extrabold text-6xl text-navy-900 mb-2">404</h1>
      <p className="font-display font-semibold text-gray-700 text-lg mb-1">Page not found</p>
      <p className="text-gray-400 text-sm mb-8 text-center max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to={homeLink} className="btn-primary gap-2">
        <Home size={16} />
        Go home
      </Link>
    </div>
  );
}
