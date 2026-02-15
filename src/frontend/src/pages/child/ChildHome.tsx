import { useGetCallerUserProfile, useGetMyParent } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import ChildCheckIn from '../../components/child/ChildCheckIn';
import ActivityHistoryList from '../../components/child/ActivityHistoryList';
import LocationHistoryList from '../../components/child/LocationHistoryList';
import ScheduleReadOnly from '../../components/schedule/ScheduleReadOnly';
import ContentFilterReadOnly from '../../components/filters/ContentFilterReadOnly';
import AlertsPanelChild from '../../components/alerts/AlertsPanelChild';
import PairWithParentCard from '../../components/child/PairWithParentCard';
import { useI18n } from '../../hooks/useI18n';

export default function ChildHome() {
  const { t } = useI18n();
  const { data: profile } = useGetCallerUserProfile();
  const { data: parentId, isLoading: parentLoading, isFetched: parentFetched } = useGetMyParent();

  const showPairingCard = !parentId && !parentLoading && parentFetched;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy-900 dark:text-navy-100 mb-2">
          {t('childHomeWelcome', { name: profile?.name || '' })}
        </h1>
        <p className="text-muted-foreground">{t('childHomeDescription')}</p>
      </div>

      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <div>
          <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold">
            {t('childHomeSupervisionNotice')}
          </AlertTitle>
          <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
            {t('childHomeSupervisionBody')}
          </AlertDescription>
        </div>
      </Alert>

      {showPairingCard && <PairWithParentCard />}

      <Tabs defaultValue="checkin">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="checkin">{t('childHomeTabCheckin')}</TabsTrigger>
          <TabsTrigger value="history">{t('childHomeTabHistory')}</TabsTrigger>
          <TabsTrigger value="schedule">{t('childHomeTabSchedule')}</TabsTrigger>
          <TabsTrigger value="filters">{t('childHomeTabFilters')}</TabsTrigger>
          <TabsTrigger value="alerts">{t('childHomeTabAlerts')}</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-4">
          <ChildCheckIn />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('childHomeActivityHistoryTitle')}</CardTitle>
              <CardDescription>{t('childHomeActivityHistoryDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHistoryList childId={null} showTransparencyLabel={false} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('childHomeLocationHistoryTitle')}</CardTitle>
              <CardDescription>{t('childHomeLocationHistoryDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <LocationHistoryList childId={null} showTransparencyLabel={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <ScheduleReadOnly childId={null} />
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <ContentFilterReadOnly childId={null} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsPanelChild childId={null} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
