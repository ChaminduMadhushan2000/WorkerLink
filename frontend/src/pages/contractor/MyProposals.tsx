import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, Search, FileText, User, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { proposalsApi } from '../../api/proposals';
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

export function MyProposals(): JSX.Element {
  const { data: res, isLoading } = useQuery({
    queryKey: ['my-proposals'],
    queryFn: () => proposalsApi.getMine(),
  });

  const proposals = res?.data.data ?? [];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">My Proposals</h1>
          <p className="text-gray-400 text-sm mt-0.5">{proposals.length} proposal{proposals.length !== 1 ? 's' : ''} submitted</p>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : proposals.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<FileText size={48} />}
              title="No proposals yet"
              description="Browse available jobs and start submitting proposals."
              action={<Link to="/contractor/browse" className="btn-primary">Browse jobs</Link>}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-semibold text-gray-900 text-sm">
                        {proposal.jobPostId}
                      </h3>
                      <Badge status={proposal.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="font-display font-bold text-navy-900 text-sm">
                        {formatLkr(proposal.proposalPriceLkrCents)}
                        {proposal.priceFormat === 'daily_rate' && <span className="font-normal text-gray-400 text-xs">/day</span>}
                      </span>
                      {proposal.estimatedDays && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {proposal.estimatedDays} days
                        </span>
                      )}
                      <span>{formatRelativeTime(proposal.createdAt)}</span>
                    </div>
                    {proposal.note && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{proposal.note}</p>
                    )}
                  </div>
                  <Link
                    to={`/contractor/browse/${proposal.jobPostId}`}
                    className="btn-ghost p-2 text-gray-400 hover:text-navy-900"
                    title="View job"
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
