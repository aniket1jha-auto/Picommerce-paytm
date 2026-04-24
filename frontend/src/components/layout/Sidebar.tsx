import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Settings2,
  Plug2,
  ChevronsLeft,
  ChevronsRight,
  Radio,
  Bot,
  Wrench,
  BarChart3,
  FileBarChart,
  Lightbulb,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePhaseStore } from '@/store/phaseStore';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

interface NavSection {
  heading?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    heading: 'BUILD',
    items: [
      { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
      { to: '/agents', icon: Bot, label: 'Agents' },
      { to: '/tools', icon: Wrench, label: 'Tools' },
    ],
  },
  {
    heading: 'PERFORMANCE',
    items: [
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/reports', icon: FileBarChart, label: 'Reports' },
    ],
  },
  {
    heading: 'ENGAGEMENT',
    items: [
      { to: '/audiences', icon: Users, label: 'Audiences' },
      { to: '/channels', icon: Radio, label: 'Channels' },
      { to: '/content-ideas', icon: Lightbulb, label: 'Content & Ideas' },
    ],
  },
  {
    heading: 'SETTINGS',
    items: [
      { to: '/settings/integrations', icon: Plug2, label: 'Integrations' },
      { to: '/settings', icon: Settings2, label: 'Settings' },
    ],
  },
];

function SidebarLink({
  to,
  icon: Icon,
  label,
  collapsed,
}: NavItem & { collapsed: boolean }) {
  return (
    <NavLink
      key={to}
      to={to}
      end={to === '/' || to === '/settings'}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'border-l-[3px] border-cyan bg-white/10 text-white'
            : 'border-l-[3px] border-transparent text-white/70 hover:bg-white/5 hover:text-white',
        ].join(' ')
      }
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="whitespace-nowrap overflow-hidden"
        >
          {label}
        </motion.span>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const collapsed = usePhaseStore((s) => s.sidebarCollapsed);
  const toggleSidebar = usePhaseStore((s) => s.toggleSidebar);

  return (
    <motion.aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-navy text-white"
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Brand — π mark + Commerce (Pi-commerce) */}
      <div className="flex h-16 items-center gap-3 px-4 shrink-0">
        <div
          className={[
            'flex shrink-0 items-center justify-center rounded-lg bg-cyan font-serif font-semibold leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]',
            collapsed
              ? 'h-8 min-w-8 px-1 text-[1.125rem]'
              : 'h-10 min-w-10 px-2 text-[1.625rem] sm:text-[1.75rem]',
          ].join(' ')}
          aria-hidden
        >
          π
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-w-0 overflow-hidden whitespace-nowrap"
          >
            <span className="inline-block border-b border-cyan/40 pb-0.5 text-[15px] font-semibold tracking-[0.08em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.2)] sm:text-[1.05rem]">
              Commerce
            </span>
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex flex-1 flex-col gap-0.5 px-2">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className={sIdx > 0 ? 'mt-3' : ''}>
            {section.heading && !collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40"
              >
                {section.heading}
              </motion.div>
            )}
            {section.heading && collapsed && (
              <div className="mx-auto my-1.5 h-px w-6 bg-white/15" />
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <SidebarLink
                  key={item.to}
                  {...item}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="flex h-12 items-center justify-center border-t border-white/10 text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
      </button>
    </motion.aside>
  );
}
