import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { type LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: NavItem[];
}

export function Sidebar({ items }: SidebarProps): JSX.Element {
  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0">
      <nav className="sticky top-24 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium transition-all duration-150',
                isActive
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={17} className={isActive ? 'text-amber-400' : ''} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
