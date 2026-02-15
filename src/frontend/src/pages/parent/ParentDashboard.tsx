import { useState } from 'react';
import { useGetCallerUserProfile, useGetMyChildren, useGetPendingPairingRequests, useAcceptPendingPairing } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Info, UserPlus, Loader2 } from 'lucide-react';
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
  const { data: pendingRequests = [] } = useGetPendingPairingRequests({ refetchInterval: 5000 });
  const acceptPairingMutation = useAcceptPendingPairing();
  const [selectedChild, setSelectedChild] = useState<Principal | null>(null);

  const handleAcceptPairing = async (requestId: bigint) => {
    try {
      await acceptPairingMutation.mutateAsync(requestId);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 dark:text-navy-100 mb-2">
          {t('parentDashboardWelcome', { name: profile?.name || '' })}
        </h1>
        <p className="text-muted-foreground">{t('parentDashboardDescription')}</p>
      </div>

      {pendingRequests.length > 0 && (
        <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {t('pendingPairingAlertTitle')}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {t('pendingPairingAlertDescription', { count: pendingRequests.length })}
              </p>
            </div>
            <Button
              onClick={() => handleAcceptPairing(pendingRequests[0].id)}
              disabled={acceptPairingMutation.isPending}
              className="ml-4"
            >
              {acceptPairingMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('pendingPairingConfirming')}
                </>
              ) : (
                t('pendingPairingConfirmButton')
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

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

                    <TabsContent value="activity">
                      <ActivityView childId={selectedChild} />
                    </TabsContent>

                    <TabsContent value="location">
                      <LocationView childId={selectedChild} />
                    </TabsContent>

                    <TabsContent value="schedule">
                      <ScheduleEditor childId={selectedChild} />
                    </TabsContent>

                    <TabsContent value="filters">
                      <ContentFilterEditor childId={selectedChild} />
                    </TabsContent>

                    <TabsContent value="alerts">
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
