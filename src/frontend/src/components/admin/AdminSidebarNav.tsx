import { useI18n } from '../../hooks/useI18n';
import { LayoutDashboard, Users, Baby, BarChart3, Battery } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminSection = 'overview' | 'parents' | 'children' | 'analytics' | 'battery';

interface AdminSidebarNavProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

export default function AdminSidebarNav({ activeSection, onSectionChange }: AdminSidebarNavProps) {
  const { t } = useI18n();

  const navItems = [
    {
      id: 'overview' as AdminSection,
      label: t('adminNavOverview'),
      icon: LayoutDashboard,
    },
    {
      id: 'parents' as AdminSection,
      label: t('adminNavParents'),
      icon: Users,
    },
    {
      id: 'children' as AdminSection,
      label: t('adminNavChildren'),
      icon: Baby,
    },
    {
      id: 'analytics' as AdminSection,
      label: t('adminNavAnalytics'),
      icon: BarChart3,
    },
    {
      id: 'battery' as AdminSection,
      label: t('adminNavBattery'),
      icon: Battery,
    },
  ];

  return (
    <aside className="w-64 border-r bg-card shrink-0">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">{t('adminSidebarTitle')}</h2>
      </div>
      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
