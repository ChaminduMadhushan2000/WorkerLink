import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Briefcase, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/auth.store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import axios from 'axios';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export function Login(): JSX.Element {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const result = res.data;
      if (result.success && result.data) {
        setAuth(result.data.user, result.data.accessToken);
        toast.success(`Welcome back, ${result.data.user.firstName}!`);
        const redirects: Record<string, string> = {
          customer: '/customer/dashboard',
          contractor: '/contractor/dashboard',
          admin: '/admin/dashboard',
        };
        navigate(redirects[result.data.user.role] ?? '/');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message as string | undefined;
        toast.error(msg ?? 'Invalid credentials');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white/10 rounded-lg">
            <Briefcase size={20} className="text-amber-400" />
          </div>
          <span className="font-display font-bold text-white text-xl">
            Worker<span className="text-amber-400">Link</span>
          </span>
        </Link>
        <div>
          <h2 className="font-display font-extrabold text-4xl text-white leading-tight mb-4">
            Sri Lanka's trusted<br />labour marketplace
          </h2>
          <p className="text-navy-300 text-base leading-relaxed max-w-md">
            Connecting customers with skilled, verified contractors for every trade — safely and transparently.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { v: '2,400+', l: 'Jobs done' },
            { v: '380+', l: 'Contractors' },
            { v: '98%', l: 'Satisfaction' },
          ].map((s) => (
            <div key={s.l} className="bg-white/5 rounded-xl p-4">
              <div className="font-display font-extrabold text-xl text-amber-400">{s.v}</div>
              <div className="text-navy-400 text-xs mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-10">
            <div className="p-1.5 bg-navy-900 rounded-lg">
              <Briefcase size={18} className="text-amber-400" />
            </div>
            <span className="font-display font-bold text-navy-900 text-lg">
              Worker<span className="text-amber-500">Link</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-1.5">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-navy-900 font-display font-semibold hover:text-amber-600 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
