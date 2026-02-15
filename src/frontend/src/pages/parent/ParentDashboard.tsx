import { useState } from 'react';
import { useGetCallerUserProfile, useGetMyChildren } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import ChildSummaryCard from '../../components/parent/ChildSummaryCard';
import ActivityView from '../../components/parent/ActivityView';
import LocationView from '../../components/parent/LocationView';
import ScheduleEditor from '../../components/schedule/ScheduleEditor';
import ContentFilterEditor from '../../components/filters/ContentFilterEditor';
import AuditLogTable from '../../components/audit/AuditLogTable';
import AlertsPanelParent from '../../components/alerts/AlertsPanelParent';
import PairingSetup from '../../components/parent/PairingSetup';
import ParentPhoneNumberCard from '../../components/parent/ParentPhoneNumberCard';
import type { Principal } from '@icp-sdk/core/principal';
import { useI18n } from '../../hooks/useI18n';

export default function ParentDashboard() {
  const { t } = useI18n();
  const { data: profile } = useGetCallerUserProfile();
  const { data: children = [] } = useGetMyChildren({ refetchInterval: 10000 });
  const [selectedChild, setSelectedChild] = useState<Principal | null>(null);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 dark:text-navy-100 mb-2">
          {t('parentDashboardWelcome', { name: profile?.name || '' })}
        </h1>
        <p className="text-muted-foreground">{t('parentDashboardDescription')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PairingSetup />
        <ParentPhoneNumberCard />
      </div>

      {children.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('parentDashboardNoChildren')}</CardTitle>
            <CardDescription>{t('parentDashboardNoChildrenDesc')}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-navy-900 dark:text-navy-100">
              Children
            </h2>
            {children.map((childId) => (
              <ChildSummaryCard
                key={childId.toString()}
                childId={childId}
                isSelected={selectedChild?.toString() === childId.toString()}
                onSelect={() => setSelectedChild(childId)}
              />
            ))}
          </div>

          <div className="lg:col-span-2">
            {!selectedChild ? (
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>{t('parentDashboardAlert')}</AlertDescription>
              </Alert>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>{t('parentDashboardChildDetails')}</CardTitle>
                  <CardDescription>{t('parentDashboardChildDetailsDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-6">
                      <TabsTrigger value="overview">{t('parentDashboardTabOverview')}</TabsTrigger>
                      <TabsTrigger value="activity">{t('parentDashboardTabActivity')}</TabsTrigger>
                      <TabsTrigger value="location">{t('parentDashboardTabLocation')}</TabsTrigger>
                      <TabsTrigger value="schedule">{t('parentDashboardTabSchedule')}</TabsTrigger>
                      <TabsTrigger value="filters">{t('parentDashboardTabFilters')}</TabsTrigger>
                      <TabsTrigger value="alerts">{t('parentDashboardTabAlerts')}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <AuditLogTable childId={selectedChild} />
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                      <ActivityView childId={selectedChild} />
                    </TabsContent>

                    <TabsContent value="location" className="space-y-4">
                      <LocationView childId={selectedChild} />
                    </TabsContent>

                    <TabsContent value="schedule" className="space-y-4">
                      <ScheduleEditor childId={selectedChild} />
                    </TabsContent>

                    <TabsContent value="filters" className="space-y-4">
                      <ContentFilterEditor childId={selectedChild} />
                    </TabsContent>

                    <TabsContent value="alerts" className="space-y-4">
                      <AlertsPanelParent childId={selectedChild} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
