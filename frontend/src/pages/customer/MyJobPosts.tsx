import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, FilePlus, LayoutGrid, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { jobPostsApi } from '../../api/job-posts';
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

export function MyJobPosts(): JSX.Element {
  const { data: res, isLoading } = useQuery({
    queryKey: ['my-job-posts'],
    queryFn: () => jobPostsApi.getMine(),
  });

  const posts = res?.data.data ?? [];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">My Jobs</h1>
            <p className="text-gray-400 text-sm mt-0.5">{posts.length} job{posts.length !== 1 ? 's' : ''} posted</p>
          </div>
          <Link to="/customer/job-posts/create" className="btn-primary">
            <FilePlus size={16} />
            New job
          </Link>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : posts.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<FileText size={48} />}
              title="No jobs posted yet"
              description="Post your first job to start receiving proposals from qualified contractors."
              action={<Link to="/customer/job-posts/create" className="btn-primary">Post your first job</Link>}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/customer/job-posts/${post.id}`}
                className="card-hover flex items-center gap-4 p-5 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-display font-semibold text-gray-900 truncate group-hover:text-navy-900">
                      {post.title}
                    </h3>
                    <Badge status={post.status} />
                  </div>
                  <p className="text-gray-400 text-xs line-clamp-1">{post.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} />
                      {post.district}, {post.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-navy-500 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
