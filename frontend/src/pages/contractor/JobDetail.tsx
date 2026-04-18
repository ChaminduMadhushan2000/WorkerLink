import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LayoutGrid, Search, FileText, User, MapPin, Calendar, MessageSquare } from 'lucide-react';
import { jobPostsApi } from '../../api/job-posts';
import { proposalsApi } from '../../api/proposals';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { PageLoader } from '../../components/ui/Spinner';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';
import axios from 'axios';

const navItems = [
  { label: 'Dashboard', path: '/contractor/dashboard', icon: LayoutGrid },
  { label: 'Browse Jobs', path: '/contractor/browse', icon: Search },
  { label: 'My Proposals', path: '/contractor/proposals', icon: FileText },
  { label: 'My Profile', path: '/contractor/profile', icon: User },
];

const schema = z.object({
  priceFormat: z.enum(['lump_sum', 'daily_rate']),
  proposalPriceLkrCents: z.number().min(1, 'Enter a valid price'),
  estimatedDays: z.number().min(1).optional(),
  note: z.string().max(1000).optional(),
  siteVisitRequested: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export function ContractorJobDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [priceInput, setPriceInput] = useState('');

  const { data: postRes, isLoading } = useQuery({
    queryKey: ['job-post', id],
    queryFn: () => jobPostsApi.getById(id!),
    enabled: !!id,
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priceFormat: 'lump_sum' },
  });

  const submitProposal = useMutation({
    mutationFn: (data: FormData) => proposalsApi.submit(id!, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['my-proposals'] });
      toast.success('Proposal submitted!');
      setShowProposalModal(false);
      reset();
      setPriceInput('');
      navigate('/contractor/proposals');
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message as string | undefined;
        toast.error(msg ?? 'Failed to submit proposal');
      }
    },
  });

  if (isLoading) return <DashboardLayout navItems={navItems}><PageLoader /></DashboardLayout>;

  const post = postRes?.data.data;
  if (!post) return <DashboardLayout navItems={navItems}><p className="text-gray-400">Job not found.</p></DashboardLayout>;

  const onSubmit = (data: FormData): void => {
    void submitProposal.mutate(data);
  };

  const handlePriceChange = (value: string): void => {
    const numeric = parseFloat(value.replace(/,/g, ''));
    setPriceInput(value);
    if (!isNaN(numeric)) {
      setValue('proposalPriceLkrCents', Math.round(numeric * 100));
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="max-w-2xl space-y-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display font-bold text-xl text-gray-900">{post.title}</h1>
            <Badge status={post.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><MapPin size={13} />{post.district}, {post.city}</span>
            <span className="flex items-center gap-1"><Calendar size={13} />{formatDate(post.createdAt)}</span>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-display font-semibold text-sm text-gray-500 mb-3">Job Description</h2>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{post.description}</p>
        </div>

        {post.materialsNote && (
          <div className="card p-5 border-l-4 border-amber-400">
            <p className="text-xs font-display font-semibold text-amber-600 mb-1">Materials Note</p>
            <p className="text-sm text-gray-600">{post.materialsNote}</p>
          </div>
        )}

        {post.status === 'open' && (
          <Button onClick={() => setShowProposalModal(true)} className="w-full" size="lg">
            <MessageSquare size={16} />
            Submit Proposal
          </Button>
        )}
      </div>

      <Modal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        title="Submit a Proposal"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Select label="Price format" error={errors.priceFormat?.message} {...register('priceFormat')}>
            <option value="lump_sum">Lump sum (total job price)</option>
            <option value="daily_rate">Daily rate (per day)</option>
          </Select>

          <div>
            <label className="label">Price (LKR)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-display">Rs.</span>
              <input
                type="number"
                className="input-field pl-10"
                placeholder="150,000"
                value={priceInput}
                onChange={(e) => handlePriceChange(e.target.value)}
              />
            </div>
            {errors.proposalPriceLkrCents && (
              <p className="error-text">{errors.proposalPriceLkrCents.message}</p>
            )}
          </div>

          <Input
            label="Estimated days (optional)"
            type="number"
            placeholder="14"
            error={errors.estimatedDays?.message}
            {...register('estimatedDays', { valueAsNumber: true })}
          />

          <Textarea
            label="Note (optional)"
            placeholder="Describe your approach, experience, or any relevant details..."
            {...register('note')}
          />

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-navy-900" {...register('siteVisitRequested')} />
            <span className="text-sm text-gray-700 font-body">I'd like to schedule a site visit first</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowProposalModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitProposal.isPending} className="flex-1">
              Submit proposal
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
