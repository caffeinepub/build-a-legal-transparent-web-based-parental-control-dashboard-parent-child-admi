import { useGetActivities, useGetSchedule } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

interface AlertsPanelParentProps {
  childId: Principal;
}

export default function AlertsPanelParent({ childId }: AlertsPanelParentProps) {
  const { data: activities = [] } = useGetActivities(childId);
  const { data: schedule } = useGetSchedule(childId);

  const dailyLimit = schedule ? Number(schedule.dailyLimitMinutes) : 120;

  // Calculate today's total
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayActivities = activities.filter((a) => {
    const activityDate = new Date(Number(a.timestamp) / 1_000_000);
    activityDate.setHours(0, 0, 0, 0);
    return activityDate.getTime() === today.getTime();
  });

  const todayTotal = todayActivities.reduce((sum, a) => sum + Number(a.durationMinutes), 0);
  const isOverLimit = todayTotal > dailyLimit;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Usage Alerts</CardTitle>
          <CardDescription>
            Supportive notifications about screen time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isOverLimit ? (
            <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-900 dark:text-amber-100">
                <strong>Daily limit exceeded:</strong> {todayTotal} minutes used today (limit: {dailyLimit} minutes).
                Consider discussing healthy screen time habits.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                <strong>Within limits:</strong> {todayTotal} minutes used today (limit: {dailyLimit} minutes).
              </AlertDescription>
            </Alert>
          )}

          <div className="p-3 border rounded-lg">
            <p className="text-sm text-muted-foreground">Today's Activity Summary</p>
            <p className="text-2xl font-bold">{todayTotal} / {dailyLimit} min</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
