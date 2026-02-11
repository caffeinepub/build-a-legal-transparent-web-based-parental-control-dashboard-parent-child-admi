import { useGetMyParent, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Info } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import ChildCheckIn from '../../components/child/ChildCheckIn';
import ScheduleReadOnly from '../../components/schedule/ScheduleReadOnly';
import ContentFilterReadOnly from '../../components/filters/ContentFilterReadOnly';
import AlertsPanelChild from '../../components/alerts/AlertsPanelChild';
import ActivityHistoryList from '../../components/child/ActivityHistoryList';
import LocationHistoryList from '../../components/child/LocationHistoryList';

export default function ChildHome() {
  const { data: parent } = useGetMyParent();
  const { data: userProfile } = useGetCallerUserProfile();
  const { identity } = useInternetIdentity();
  const childId = identity?.getPrincipal() || null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">
          Welcome, {userProfile?.name}!
        </h2>
        <p className="text-muted-foreground">
          Your activity dashboard with full transparency
        </p>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          <strong>Supervision Notice:</strong> Your parent can see the information you choose to share. All submissions require your explicit consent. There is no hidden monitoring.
        </AlertDescription>
      </Alert>

      {!parent && (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            You are not currently paired with a parent. Ask your parent for a pairing code to connect.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="checkin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
          <TabsTrigger value="history">My History</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin">
          <ChildCheckIn />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Activity History</CardTitle>
              <CardDescription>
                Activities you've submitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHistoryList childId={childId} showTransparencyLabel={false} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Location History</CardTitle>
              <CardDescription>
                Locations you've shared
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationHistoryList childId={childId} showTransparencyLabel={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <ScheduleReadOnly childId={childId} />
        </TabsContent>

        <TabsContent value="filters">
          <ContentFilterReadOnly childId={childId} />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsPanelChild childId={childId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
