import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FilePlus, FileText, LayoutGrid } from 'lucide-react';
import { jobPostsApi } from '../../api/job-posts';
import { categoriesApi } from '../../api/categories';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import axios from 'axios';

const navItems = [
  { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutGrid },
  { label: 'Post a Job', path: '/customer/job-posts/create', icon: FilePlus },
  { label: 'My Jobs', path: '/customer/job-posts', icon: FileText },
];

const sriLankaDistricts = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
  'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
  'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala',
  'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura',
  'Trincomalee', 'Vavuniya',
];

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  categoryId: z.string().min(1, 'Select a category'),
  district: z.string().min(1, 'Select a district'),
  city: z.string().min(1, 'Enter your city').max(100),
  addressText: z.string().max(500).optional(),
  preferredStartDateFrom: z.string().optional(),
  materialsNote: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

export function CreateJobPost(): JSX.Element {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const categories = categoriesRes?.data.data ?? [];

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    setLoading(true);
    try {
      const res = await jobPostsApi.create(data);
      if (res.data.success) {
        toast.success('Job post created successfully!');
        navigate('/customer/job-posts');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message as string | undefined;
        toast.error(msg ?? 'Failed to create job post');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-gray-900">Post a new job</h1>
          <p className="text-gray-400 text-sm mt-1">Describe what labour you need — contractors will send you proposals.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="card p-6 space-y-5">
            <h2 className="font-display font-semibold text-gray-800 pb-3 border-b border-gray-50">Job details</h2>

            <Input
              label="Job title"
              placeholder="e.g. Need mason to build boundary wall"
              error={errors.title?.message}
              {...register('title')}
            />

            <Textarea
              label="Description"
              placeholder="Describe the work in detail — dimensions, materials approach, access, timeline expectations..."
              error={errors.description?.message}
              {...register('description')}
            />

            <Select label="Trade category" error={errors.categoryId?.message} {...register('categoryId')}>
              <option value="">Select a trade</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>
          </div>

          <div className="card p-6 space-y-5">
            <h2 className="font-display font-semibold text-gray-800 pb-3 border-b border-gray-50">Location</h2>

            <div className="grid grid-cols-2 gap-4">
              <Select label="District" error={errors.district?.message} {...register('district')}>
                <option value="">Select district</option>
                {sriLankaDistricts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>

              <Input
                label="City / Town"
                placeholder="e.g. Negombo"
                error={errors.city?.message}
                {...register('city')}
              />
            </div>

            <Input
              label="Address (optional)"
              placeholder="Street address or landmark"
              {...register('addressText')}
            />
          </div>

          <div className="card p-6 space-y-5">
            <h2 className="font-display font-semibold text-gray-800 pb-3 border-b border-gray-50">Additional info</h2>

            <Input
              label="Preferred start date (optional)"
              type="date"
              hint="When would you like the work to begin?"
              {...register('preferredStartDateFrom')}
            />

            <Input
              label="Materials note (optional)"
              placeholder="e.g. Customer will provide all materials"
              hint="This platform covers labour only — note any material arrangement here."
              {...register('materialsNote')}
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/customer/job-posts')}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Post job
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
