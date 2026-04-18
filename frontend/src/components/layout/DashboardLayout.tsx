import { type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { type LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  navItems: NavItem[];
  children: ReactNode;
}

export function DashboardLayout({ navItems, children }: DashboardLayoutProps): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar items={navItems} />
          <main className="flex-1 min-w-0 animate-fade-in">{children}</main>
        </div>
      </div>
    </div>
  );
}
