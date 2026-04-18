import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, Search, FileText, User, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { proposalsApi } from '../../api/proposals';
import { useAuthStore } from '../../store/auth.store';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { PageLoader } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatLkr, formatRelativeTime } from '../../lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/contractor/dashboard', icon: LayoutGrid },
  { label: 'Browse Jobs', path: '/contractor/browse', icon: Search },
  { label: 'My Proposals', path: '/contractor/proposals', icon: FileText },
  { label: 'My Profile', path: '/contractor/profile', icon: User },
];

export function ContractorDashboard(): JSX.Element {
  const user = useAuthStore((s) => s.user);

  const { data: proposalsRes, isLoading } = useQuery({
    queryKey: ['my-proposals'],
    queryFn: () => proposalsApi.getMine(),
  });

  const proposals = proposalsRes?.data.data ?? [];
  const accepted = proposals.filter((p) => p.status === 'accepted');
  const pending = proposals.filter((p) => p.status === 'pending');
  const shortlisted = proposals.filter((p) => p.status === 'shortlisted');

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900">Good day, {user?.firstName}</h1>
            <p className="text-gray-400 text-sm mt-0.5">Here's your proposal activity</p>
          </div>
          <Link to="/contractor/browse" className="btn-primary">
            <Search size={16} />
            Browse jobs
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Proposals', value: proposals.length, icon: FileText, color: 'text-navy-900 bg-navy-50' },
            { label: 'Pending', value: pending.length, icon: Clock, color: 'text-amber-700 bg-amber-50' },
            { label: 'Shortlisted', value: shortlisted.length, icon: ArrowRight, color: 'text-blue-700 bg-blue-50' },
            { label: 'Accepted', value: accepted.length, icon: CheckCircle, color: 'text-emerald-700 bg-emerald-50' },
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

        {/* Recent Proposals */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-display font-semibold text-gray-900">Recent Proposals</h2>
            <Link to="/contractor/proposals" className="text-xs text-navy-600 font-display font-medium hover:text-navy-900 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {isLoading ? (
            <PageLoader />
          ) : proposals.length === 0 ? (
            <EmptyState
              icon={<FileText size={40} />}
              title="No proposals yet"
              description="Browse available jobs and submit your first proposal."
              action={<Link to="/contractor/browse" className="btn-primary">Browse jobs</Link>}
            />
          ) : (
            <div className="divide-y divide-gray-50">
              {proposals.slice(0, 5).map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-display font-medium text-sm text-gray-900 truncate">
                      {proposal.jobPostId}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(proposal.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="font-display font-bold text-sm text-navy-900">{formatLkr(proposal.proposalPriceLkrCents)}</span>
                    <Badge status={proposal.status} />
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
