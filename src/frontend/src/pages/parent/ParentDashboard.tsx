import { useState } from 'react';
import { useGetMyChildren, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, AlertCircle, Info } from 'lucide-react';
import ChildSummaryCard from '../../components/parent/ChildSummaryCard';
import ActivityView from '../../components/parent/ActivityView';
import LocationView from '../../components/parent/LocationView';
import ScheduleEditor from '../../components/schedule/ScheduleEditor';
import ContentFilterEditor from '../../components/filters/ContentFilterEditor';
import AlertsPanel from '../../components/alerts/AlertsPanelParent';
import AuditLogTable from '../../components/audit/AuditLogTable';
import PairingSetup from '../../components/parent/PairingSetup';
import type { Principal } from '@icp-sdk/core/principal';

export default function ParentDashboard() {
  const { data: children = [] } = useGetMyChildren();
  const { data: userProfile } = useGetCallerUserProfile();
  const [selectedChild, setSelectedChild] = useState<Principal | null>(null);

  if (children.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Parent Dashboard
            </CardTitle>
            <CardDescription>
              Welcome, {userProfile?.name}! Set up your first child connection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PairingSetup />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">
          Parent Dashboard
        </h2>
        <p className="text-muted-foreground">
          Monitor and guide your children with transparency and consent
        </p>
      </div>

      <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-900 dark:text-amber-100">
          All data shown here is voluntarily submitted by your child with their explicit consent. No hidden monitoring occurs.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {children.map((childId) => (
          <ChildSummaryCard
            key={childId.toString()}
            childId={childId}
            isSelected={selectedChild?.toString() === childId.toString()}
            onSelect={() => setSelectedChild(childId)}
          />
        ))}
      </div>

      {selectedChild && (
        <Card>
          <CardHeader>
            <CardTitle>Child Details</CardTitle>
            <CardDescription>
              View and manage settings for the selected child
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                <TabsTrigger value="audit">Audit Log</TabsTrigger>
              </TabsList>

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
                <AlertsPanel childId={selectedChild} />
              </TabsContent>

              <TabsContent value="audit" className="space-y-4">
                <AuditLogTable childId={selectedChild} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <PairingSetup />
        </CardContent>
      </Card>
    </div>
  );
}
