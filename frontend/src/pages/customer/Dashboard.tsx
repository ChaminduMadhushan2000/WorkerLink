import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, FilePlus, FileText, MessageSquare, Plus, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { jobPostsApi } from '../../api/job-posts';
import { useAuthStore } from '../../store/auth.store';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutGrid },
  { label: 'Post a Job', path: '/customer/job-posts/create', icon: FilePlus },
  { label: 'My Jobs', path: '/customer/job-posts', icon: FileText },
];

export function CustomerDashboard(): JSX.Element {
  const user = useAuthStore((s) => s.user);

  const { data: jobPostsRes, isLoading } = useQuery({
    queryKey: ['my-job-posts'],
    queryFn: () => jobPostsApi.getMine(),
  });

  const posts = jobPostsRes?.data.data ?? [];
  const activePosts = posts.filter((p) => ['open', 'negotiation', 'price_locked', 'active'].includes(p.status));
  const completedPosts = posts.filter((p) => p.status === 'completed');

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">
              Good day, {user?.firstName}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Here's what's happening with your jobs</p>
          </div>
          <Link to="/customer/job-posts/create" className="btn-primary">
            <Plus size={16} />
            Post a job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Jobs', value: posts.length, icon: FileText, color: 'text-navy-900 bg-navy-50' },
            { label: 'Active Jobs', value: activePosts.length, icon: Clock, color: 'text-amber-700 bg-amber-50' },
            { label: 'Completed', value: completedPosts.length, icon: CheckCircle, color: 'text-emerald-700 bg-emerald-50' },
            { label: 'Open for Proposals', value: posts.filter(p => p.status === 'open').length, icon: MessageSquare, color: 'text-blue-700 bg-blue-50' },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className={`p-2 rounded-lg w-fit mb-3 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div className="font-display font-bold text-2xl text-gray-900">{stat.value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent jobs */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-display font-semibold text-gray-900">Recent Jobs</h2>
            <Link to="/customer/job-posts" className="text-xs text-navy-600 font-display font-medium hover:text-navy-900 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {isLoading ? (
            <PageLoader />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<FileText size={40} />}
              title="No jobs yet"
              description="Post your first job to start receiving proposals from contractors."
              action={<Link to="/customer/job-posts/create" className="btn-primary">Post a job</Link>}
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {posts.slice(0, 5).map((post) => (
                <Link
                  key={post.id}
                  to={`/customer/job-posts/${post.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="font-display font-medium text-sm text-gray-900 truncate group-hover:text-navy-900">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {post.district}, {post.city} · {formatDate(post.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge status={post.status} />
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
