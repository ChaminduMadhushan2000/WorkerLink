import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { LayoutGrid, Search, FileText, User, CheckCircle } from 'lucide-react';
import { contractorApi } from '../../api/contractor';
import { categoriesApi } from '../../api/categories';
import { useAuthStore } from '../../store/auth.store';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';
import axios from 'axios';

const navItems = [
  { label: 'Dashboard', path: '/contractor/dashboard', icon: LayoutGrid },
  { label: 'Browse Jobs', path: '/contractor/browse', icon: Search },
  { label: 'My Proposals', path: '/contractor/proposals', icon: FileText },
  { label: 'My Profile', path: '/contractor/profile', icon: User },
];

const schema = z.object({
  companyName: z.string().min(2).max(200),
  bio: z.string().max(500).optional(),
  contactPhone: z.string().min(9).max(20),
  contactEmail: z.string().email(),
  availabilityStatus: z.enum(['available', 'limited', 'unavailable']),
  workforceSizeMin: z.number().min(1).optional(),
  workforceSizeMax: z.number().min(1).optional(),
});

type FormData = z.infer<typeof schema>;

export function ContractorProfile(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [areaInput, setAreaInput] = useState('');

  const { data: profileRes, isLoading: profileLoading } = useQuery({
    queryKey: ['my-contractor-profile'],
    queryFn: () => contractorApi.getMyProfile(),
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const profile = profileRes?.data.data;
  const categories = categoriesRes?.data.data ?? [];

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        companyName: profile.companyName,
        bio: profile.bio ?? '',
        contactPhone: profile.contactPhone,
        contactEmail: profile.contactEmail,
        availabilityStatus: profile.availabilityStatus,
        workforceSizeMin: profile.workforceSizeMin ?? undefined,
        workforceSizeMax: profile.workforceSizeMax ?? undefined,
      });
      setSelectedCategories(profile.categories.map((c) => c.id));
      setServiceAreas(profile.serviceAreas ?? []);
    }
  }, [profile, reset]);

  const onSubmit = async (data: FormData): Promise<void> => {
    setLoading(true);
    try {
      const payload = { ...data, categoryIds: selectedCategories, serviceAreas };
      if (profile) {
        await contractorApi.updateProfile(payload);
      } else {
        await contractorApi.createProfile(payload);
      }
      void queryClient.invalidateQueries({ queryKey: ['my-contractor-profile'] });
      toast.success('Profile saved!');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message as string | undefined;
        toast.error(msg ?? 'Failed to save profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const addArea = (): void => {
    if (areaInput.trim() && !serviceAreas.includes(areaInput.trim())) {
      setServiceAreas((prev) => [...prev, areaInput.trim()]);
      setAreaInput('');
    }
  };

  const toggleCategory = (id: string): void => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  if (profileLoading) return <DashboardLayout navItems={navItems}><PageLoader /></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">Contractor Profile</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {profile ? 'Update your profile visible to customers' : 'Create your profile to start receiving jobs'}
            </p>
          </div>
          {profile?.isVerified && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-display font-semibold">
              <CheckCircle size={16} /> Verified
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="card p-6 space-y-4">
            <h2 className="font-display font-semibold text-gray-800 pb-3 border-b border-gray-50">Company Info</h2>
            <Input label="Company / Trading name" placeholder="Silva Constructions" error={errors.companyName?.message} {...register('companyName')} />
            <Textarea label="Bio (optional)" placeholder="Tell customers about your experience, qualifications, and approach..." {...register('bio')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Contact phone" placeholder="077 1234567" error={errors.contactPhone?.message} {...register('contactPhone')} />
              <Input label="Contact email" type="email" placeholder="contact@example.com" error={errors.contactEmail?.message} {...register('contactEmail')} />
            </div>
            <Select label="Availability" error={errors.availabilityStatus?.message} {...register('availabilityStatus')}>
              <option value="available">Available</option>
              <option value="limited">Limited availability</option>
              <option value="unavailable">Unavailable</option>
            </Select>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-display font-semibold text-gray-800 pb-3 border-b border-gray-50">Trades</h2>
            <div>
              <label className="label">Select your trade categories</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-display font-medium border transition-all ${
                      selectedCategories.includes(cat.id)
                        ? 'bg-navy-900 text-white border-navy-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-navy-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-display font-semibold text-gray-800 pb-3 border-b border-gray-50">Service Areas</h2>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Gampaha"
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArea(); } }}
              />
              <Button type="button" variant="secondary" onClick={addArea}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {serviceAreas.map((area) => (
                <span key={area} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-gray-700 text-xs font-display rounded-lg">
                  {area}
                  <button type="button" onClick={() => setServiceAreas((prev) => prev.filter((a) => a !== area))} className="text-gray-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {profile ? 'Save changes' : 'Create profile'}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
