import { useState } from 'react';
import { useGetActivities, useGetSchedule } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { Principal } from '@icp-sdk/core/principal';

interface AlertsPanelChildProps {
  childId: Principal | null;
}

export default function AlertsPanelChild({ childId }: AlertsPanelChildProps) {
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
    // This would send a note to the parent when backend supports it
    toast.info('Note saved locally (backend support needed for parent notification)');
    setRequestNote('');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Usage Today</CardTitle>
          <CardDescription>
            Track your screen time and stay within healthy limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOverLimit ? (
            <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-900 dark:text-amber-100">
                <strong>Daily limit reached:</strong> You've used {todayTotal} minutes today (limit: {dailyLimit} minutes).
                Consider taking a break or asking for more time.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-900 dark:text-green-100">
                <strong>You're doing great!</strong> {todayTotal} minutes used today (limit: {dailyLimit} minutes).
              </AlertDescription>
            </Alert>
          )}

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Today's Total</p>
            <p className="text-3xl font-bold">{todayTotal} / {dailyLimit} min</p>
          </div>

          {isOverLimit && (
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Request More Time
              </p>
              <Textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                placeholder="Explain why you need more time today..."
                rows={3}
              />
              <Button
                onClick={handleRequestMoreTime}
                disabled={!requestNote.trim()}
                variant="outline"
                className="w-full"
              >
                Send Request to Parent
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
