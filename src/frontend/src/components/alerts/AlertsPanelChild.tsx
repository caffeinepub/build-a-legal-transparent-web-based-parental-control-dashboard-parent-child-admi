import { useState } from 'react';
import { useGetActivities, useGetSchedule } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { Principal } from '@icp-sdk/core/principal';
import { useI18n } from '../../hooks/useI18n';

interface AlertsPanelChildProps {
  childId: Principal | null;
}

export default function AlertsPanelChild({ childId }: AlertsPanelChildProps) {
  const { t } = useI18n();
  const { data: activities = [] } = useGetActivities(childId);
  const { data: schedule } = useGetSchedule(childId);
  const [requestNote, setRequestNote] = useState('');

  const dailyLimit = schedule ? Number(schedule.dailyLimitMinutes) : 120;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayActivities = activities.filter((a) => {
    const activityDate = new Date(Number(a.timestamp) / 1_000_000);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate.getTime() === today.getTime();
  });

  const todayTotal = todayActivities.reduce((sum, a) => sum + Number(a.durationMinutes), 0);
  const isOverLimit = todayTotal > dailyLimit;

  const handleRequestMoreTime = () => {
    toast.info(t('alertsChildRequestSent'));
    setRequestNote('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('alertsChildTitle')}</CardTitle>
          <CardDescription>{t('alertsChildDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOverLimit ? (
            <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-900 dark:text-amber-100">
                <strong>{t('alertsChildOverLimit')}</strong> {t('alertsChildOverLimitBody', { total: todayTotal, limit: dailyLimit })}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                <strong>{t('alertsChildWithinLimit')}</strong> {t('alertsChildWithinLimitBody', { total: todayTotal, limit: dailyLimit })}
              </AlertDescription>
            </Alert>
          )}

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">{t('alertsChildTodayTotal')}</p>
            <p className="text-3xl font-bold">{t('alertsChildTodayValue', { total: todayTotal, limit: dailyLimit })}</p>
          </div>

          {isOverLimit && (
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {t('alertsChildRequestTitle')}
              </p>
              <Textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                placeholder={t('alertsChildRequestPlaceholder')}
                rows={3}
              />
              <Button
                onClick={handleRequestMoreTime}
                disabled={!requestNote.trim()}
                variant="outline"
                className="w-full"
              >
                {t('alertsChildRequestButton')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
