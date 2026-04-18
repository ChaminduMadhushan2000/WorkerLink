import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, Users, FileText, Shield, Search } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/auth.store';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../lib/utils';
import type { ApiResponse, User } from '../../types';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutGrid },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
];

export function AdminDashboard(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  const { data: auditRes, isLoading: auditLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => apiClient.get<ApiResponse<unknown[]>>('/admin/audit-logs'),
  });

  const auditLogs = auditRes?.data.data ?? [];

  const handleSearch = async (): Promise<void> => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await apiClient.get<ApiResponse<User[]>>(`/admin/users/search?q=${searchQuery}`);
      setSearchResults(res.data.data ?? []);
    } catch {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Admin Console</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage users, contractors, and platform operations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Audit Log Entries', value: auditLogs.length, icon: FileText },
            { label: 'Admin', value: user?.firstName, icon: Shield },
            { label: 'Status', value: 'Active', icon: LayoutGrid },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="p-2 bg-navy-50 rounded-lg w-fit mb-3">
                <stat.icon size={18} className="text-navy-900" />
              </div>
              <div className="font-display font-bold text-xl text-gray-900">{stat.value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* User Search */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-gray-900 mb-4">Search Users</h2>
          <div className="flex gap-3 mb-4">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch(); }}
              className="flex-1"
            />
            <Button loading={searching} onClick={() => void handleSearch()}>
              <Search size={16} />
              Search
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="divide-y divide-gray-50">
              {searchResults.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-display font-medium text-sm text-gray-900">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-gray-400">{u.email} · {u.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={u.role} />
                    <Badge status={u.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Logs */}
        <div className="card">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="font-display font-semibold text-gray-900">Recent Audit Logs</h2>
          </div>
          {auditLoading ? (
            <PageLoader />
          ) : auditLogs.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No audit logs yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {(auditLogs as Array<Record<string, unknown>>).slice(0, 20).map((log, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-display font-medium text-sm text-gray-800">{String(log['action'] ?? '')}</p>
                    <p className="text-xs text-gray-400">Admin: {String(log['actorAdminId'] ?? '')}</p>
                  </div>
                  <p className="text-xs text-gray-400">{log['occurredAt'] ? formatDate(String(log['occurredAt'])) : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
