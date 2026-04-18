import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Briefcase, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import toast from 'react-hot-toast';
import axios from 'axios';

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(9, 'Enter a valid phone number').max(15),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[^A-Za-z0-9]/, 'Must include a special character'),
  role: z.enum(['customer', 'contractor'], { required_error: 'Select a role' }),
});

type FormData = z.infer<typeof schema>;

export function Register(): JSX.Element {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    setLoading(true);
    try {
      const res = await authApi.register(data);
      if (res.data.success) {
        toast.success('Account created! Please sign in.');
        navigate('/login');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message as string | undefined;
        toast.error(msg ?? 'Registration failed. Please try again.');
      } else {
        toast.error('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12">
      <div className="max-w-md w-full mx-auto">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="p-1.5 bg-navy-900 rounded-lg">
            <Briefcase size={18} className="text-amber-400" />
          </div>
          <span className="font-display font-bold text-navy-900 text-lg">
            Worker<span className="text-amber-500">Link</span>
          </span>
        </Link>

        <div className="card p-8">
          <div className="mb-7">
            <h1 className="font-display font-bold text-2xl text-gray-900 mb-1.5">Create your account</h1>
            <p className="text-gray-400 text-sm">Join WorkerLink — free to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                placeholder="Kamal"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last name"
                placeholder="Perera"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone number"
              type="tel"
              placeholder="077 1234567"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Select label="I am a..." error={errors.role?.message} {...register('role')}>
              <option value="">Select your role</option>
              <option value="customer">Customer — I need workers</option>
              <option value="contractor">Contractor — I supply workers</option>
            </Select>

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                hint="Min 8 chars, 1 uppercase, 1 number, 1 special character"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-navy-900 font-display font-semibold hover:text-amber-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
