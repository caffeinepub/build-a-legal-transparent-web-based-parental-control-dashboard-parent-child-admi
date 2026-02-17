import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import AdminSidebarNav from '../../components/admin/AdminSidebarNav';
import AdminOverviewCards from '../../components/admin/AdminOverviewCards';
import AdminUsersListPanel from '../../components/admin/AdminUsersListPanel';
import AdminLoginAnalyticsPanel from '../../components/admin/AdminLoginAnalyticsPanel';
import AdminBatteryStatusPanel from '../../components/admin/AdminBatteryStatusPanel';
import { AppRole } from '../../backend';

type AdminSection = 'overview' | 'parents' | 'children' | 'analytics' | 'battery';

export default function AdminPanel() {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebarNav activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('adminDashboardTitle')}</h1>
            <p className="text-muted-foreground mt-1">{t('adminDashboardSubtitle')}</p>
          </div>

          {activeSection === 'overview' && (
            <AdminOverviewCards onNavigate={setActiveSection} />
          )}

          {activeSection === 'parents' && (
            <AdminUsersListPanel role="parent" />
          )}

          {activeSection === 'children' && (
            <AdminUsersListPanel role="child" />
          )}

          {activeSection === 'analytics' && (
            <AdminLoginAnalyticsPanel />
          )}

          {activeSection === 'battery' && (
            <AdminBatteryStatusPanel />
          )}
        </div>
      </main>
    </div>
  );
}
