import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';

export function Navbar(): JSX.Element {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  const getDashboardPath = (): string => {
    if (!user) return '/';
    const paths: Record<string, string> = {
      customer: '/customer/dashboard',
      contractor: '/contractor/dashboard',
      admin: '/admin/dashboard',
    };
    return paths[user.role] ?? '/';
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={getDashboardPath()} className="flex items-center gap-2.5 group">
            <div className="p-1.5 bg-navy-900 rounded-lg group-hover:bg-navy-700 transition-colors">
              <Briefcase size={18} className="text-amber-400" />
            </div>
            <span className="font-display font-bold text-navy-900 text-lg tracking-tight">
              Worker<span className="text-amber-500">Link</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Get started</Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 bg-navy-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-display font-bold">
                      {user?.firstName[0]}{user?.lastName[0]}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-display font-semibold text-gray-900 leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="btn-ghost text-sm text-gray-500 gap-1.5">
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="block btn-ghost w-full justify-start" onClick={() => setMobileOpen(false)}>Sign in</Link>
                <Link to="/register" className="block btn-primary w-full" onClick={() => setMobileOpen(false)}>Get started</Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-2">
                  <div className="w-9 h-9 bg-navy-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-display font-bold">
                      {user?.firstName[0]}{user?.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                  </div>
                </div>
                <button onClick={() => { setMobileOpen(false); void handleLogout(); }} className="btn-ghost w-full justify-start text-red-500 gap-2">
                  <LogOut size={15} />
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
