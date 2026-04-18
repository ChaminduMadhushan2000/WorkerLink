import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, Search, FileText, User, MapPin, Calendar, Filter, ArrowRight } from 'lucide-react';
import { jobPostsApi } from '../../api/job-posts';
import { categoriesApi } from '../../api/categories';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/contractor/dashboard', icon: LayoutGrid },
  { label: 'Browse Jobs', path: '/contractor/browse', icon: Search },
  { label: 'My Proposals', path: '/contractor/proposals', icon: FileText },
  { label: 'My Profile', path: '/contractor/profile', icon: User },
];

const sriLankaDistricts = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle',
  'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle',
  'Kurunegala', 'Matale', 'Matara', 'Monaragala', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

export function BrowseJobs(): JSX.Element {
  const [filters, setFilters] = useState({ categoryId: '', district: '', city: '' });

  const { data: jobsRes, isLoading } = useQuery({
    queryKey: ['browse-jobs', filters],
    queryFn: () => jobPostsApi.browse({ ...filters, limit: 50 }),
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const posts = jobsRes?.data.data?.posts ?? [];
  const total = jobsRes?.data.data?.total ?? 0;
  const categories = categoriesRes?.data.data ?? [];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Browse Jobs</h1>
          <p className="text-gray-400 text-sm mt-0.5">{total} open job{total !== 1 ? 's' : ''} available</p>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3 text-sm font-display font-medium text-gray-600">
            <Filter size={14} /> Filters
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Select
              label="Trade"
              value={filters.categoryId}
              onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="">All trades</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </Select>

            <Select
              label="District"
              value={filters.district}
              onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
            >
              <option value="">All districts</option>
              {sriLankaDistricts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>

            <Input
              label="City"
              placeholder="Search by city..."
              value={filters.city}
              onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <PageLoader />
        ) : posts.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Search size={48} />}
              title="No jobs found"
              description="Try adjusting your filters to see more results."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/contractor/browse/${post.id}`}
                className="card-hover p-5 flex items-start gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-display font-semibold text-gray-900 group-hover:text-navy-900 truncate">
                      {post.title}
                    </h3>
                    {post.category && (
                      <span className="shrink-0 text-xs bg-navy-50 text-navy-700 px-2 py-0.5 rounded-md font-display font-medium">
                        {post.category.name}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs line-clamp-2 mb-2">{post.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={11} />{post.district}, {post.city}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-navy-500 shrink-0 mt-1 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
