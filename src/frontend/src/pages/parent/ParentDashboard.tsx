import { useState } from 'react';
import { useGetMyChildren, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import ChildSummaryCard from '../../components/parent/ChildSummaryCard';
import PairingSetup from '../../components/parent/PairingSetup';
import ActivityView from '../../components/parent/ActivityView';
import LocationView from '../../components/parent/LocationView';
import ScheduleEditor from '../../components/schedule/ScheduleEditor';
import ContentFilterEditor from '../../components/filters/ContentFilterEditor';
import AlertsPanelParent from '../../components/alerts/AlertsPanelParent';
import AuditLogTable from '../../components/audit/AuditLogTable';
import type { Principal } from '@icp-sdk/core/principal';
import { useI18n } from '../../hooks/useI18n';

export default function ParentDashboard() {
  const { t } = useI18n();
  const { data: profile } = useGetCallerUserProfile();
  const { data: children = [] } = useGetMyChildren();
  const [selectedChild, setSelectedChild] = useState<Principal | null>(null);

  if (children.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-navy-100 mb-2">
            {t('parentDashboardTitle')}
          </h1>
          <p className="text-muted-foreground">
            {t('parentDashboardWelcome', { name: profile?.name || '' })}
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t('parentDashboardNoChildren')}</CardTitle>
            <CardDescription>{t('parentDashboardNoChildrenDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <PairingSetup />
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentChild = selectedChild || children[0];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 dark:text-navy-100 mb-2">
          {t('parentDashboardTitle')}
        </h1>
        <p className="text-muted-foreground">{t('parentDashboardDescription')}</p>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
          {t('parentDashboardAlert')}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {children.map((childId) => (
          <ChildSummaryCard
            key={childId.toString()}
            childId={childId}
            isSelected={currentChild.toString() === childId.toString()}
            onSelect={() => setSelectedChild(childId)}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('parentDashboardChildDetails')}</CardTitle>
          <CardDescription>{t('parentDashboardChildDetailsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="activity">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="activity">{t('parentDashboardTabActivity')}</TabsTrigger>
              <TabsTrigger value="location">{t('parentDashboardTabLocation')}</TabsTrigger>
              <TabsTrigger value="schedule">{t('parentDashboardTabSchedule')}</TabsTrigger>
              <TabsTrigger value="filters">{t('parentDashboardTabFilters')}</TabsTrigger>
              <TabsTrigger value="alerts">{t('parentDashboardTabAlerts')}</TabsTrigger>
              <TabsTrigger value="audit">{t('parentDashboardTabAudit')}</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-4">
              <ActivityView childId={currentChild} />
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <LocationView childId={currentChild} />
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <ScheduleEditor childId={currentChild} />
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <ContentFilterEditor childId={currentChild} />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <AlertsPanelParent childId={currentChild} />
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <AuditLogTable childId={currentChild} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
