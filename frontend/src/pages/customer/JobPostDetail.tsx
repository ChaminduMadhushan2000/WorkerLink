import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, FilePlus, LayoutGrid, MapPin, Calendar, User, Star, Clock } from 'lucide-react';
import { jobPostsApi } from '../../api/job-posts';
import { proposalsApi } from '../../api/proposals';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, formatLkr, formatRelativeTime } from '../../lib/utils';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutGrid },
  { label: 'Post a Job', path: '/customer/job-posts/create', icon: FilePlus },
  { label: 'My Jobs', path: '/customer/job-posts', icon: FileText },
];

export function JobPostDetail(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: postRes, isLoading: postLoading } = useQuery({
    queryKey: ['job-post', id],
    queryFn: () => jobPostsApi.getById(id!),
    enabled: !!id,
  });

  const { data: proposalsRes, isLoading: proposalsLoading } = useQuery({
    queryKey: ['proposals', id],
    queryFn: () => proposalsApi.getForJobPost(id!),
    enabled: !!id,
  });

  const updateStatus = useMutation({
    mutationFn: ({ proposalId, status }: { proposalId: string; status: 'shortlisted' | 'rejected' }) =>
      proposalsApi.updateStatus(proposalId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['proposals', id] });
      toast.success('Proposal updated');
    },
    onError: () => toast.error('Failed to update proposal'),
  });

  const closePost = useMutation({
    mutationFn: () => jobPostsApi.close(id!),
    onSuccess: () => {
      toast.success('Job post closed');
      navigate('/customer/job-posts');
    },
    onError: () => toast.error('Failed to close post'),
  });

  if (postLoading) return <DashboardLayout navItems={navItems}><PageLoader /></DashboardLayout>;

  const post = postRes?.data.data;
  if (!post) return <DashboardLayout navItems={navItems}><p className="text-gray-400">Job post not found.</p></DashboardLayout>;

  const proposals = proposalsRes?.data.data ?? [];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
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
          {['open', 'draft'].includes(post.status) && (
            <Button
              variant="danger"
              size="sm"
              loading={closePost.isPending}
              onClick={() => { if (window.confirm('Close this job post?')) void closePost.mutate(); }}
            >
              Close post
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — Post details */}
          <div className="lg:col-span-2 space-y-4">
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
          </div>

          {/* Right — Details */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-display font-semibold text-sm text-gray-500 mb-4">Details</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Location</span>
                  <span className="font-display font-medium text-gray-700">{post.district}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">City</span>
                  <span className="font-display font-medium text-gray-700">{post.city}</span>
                </div>
                {post.preferredStartDateFrom && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Start date</span>
                    <span className="font-display font-medium text-gray-700">{formatDate(post.preferredStartDateFrom)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Proposals</span>
                  <span className="font-display font-bold text-navy-900">{proposals.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proposals */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-display font-semibold text-gray-900">
              Proposals <span className="text-gray-400 font-normal">({proposals.length})</span>
            </h2>
          </div>

          {proposalsLoading ? (
            <PageLoader />
          ) : proposals.length === 0 ? (
            <EmptyState
              icon={<User size={40} />}
              title="No proposals yet"
              description="Contractors will submit proposals once your job is visible. Make sure your post is open."
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-navy-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-navy-700" />
                        </div>
                        <div>
                          <p className="font-display font-semibold text-sm text-gray-900">
                            {proposal.contractor?.companyName ?? 'Contractor'}
                          </p>
                          <p className="text-xs text-gray-400">{formatRelativeTime(proposal.createdAt)}</p>
                        </div>
                        <Badge status={proposal.status} />
                      </div>

                      <div className="flex items-center gap-4 mb-3 ml-12">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                          <span className="font-display font-bold text-gray-900">{formatLkr(proposal.proposalPriceLkrCents)}</span>
                          <span className="text-gray-400 text-xs">{proposal.priceFormat === 'daily_rate' ? '/day' : 'lump sum'}</span>
                        </div>
                        {proposal.estimatedDays && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            {proposal.estimatedDays} day{proposal.estimatedDays !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      {proposal.note && (
                        <p className="text-sm text-gray-600 ml-12 leading-relaxed">{proposal.note}</p>
                      )}
                    </div>

                    {proposal.status === 'pending' && (
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={updateStatus.isPending}
                          onClick={() => void updateStatus.mutate({ proposalId: proposal.id, status: 'shortlisted' })}
                        >
                          Shortlist
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={updateStatus.isPending}
                          onClick={() => void updateStatus.mutate({ proposalId: proposal.id, status: 'rejected' })}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
