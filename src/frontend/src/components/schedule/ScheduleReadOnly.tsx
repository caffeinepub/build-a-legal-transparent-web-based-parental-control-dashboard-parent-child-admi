import { useGetSchedule } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

interface ScheduleReadOnlyProps {
  childId: Principal | null;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ScheduleReadOnly({ childId }: ScheduleReadOnlyProps) {
  const { data: schedule, isLoading } = useGetSchedule(childId);

  if (isLoading) {
    return <p className="text-muted-foreground text-center py-8">Loading...</p>;
  }

  if (!schedule) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No schedule configured yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Your Schedule & Limits
          </CardTitle>
          <CardDescription>
            These are guidance policies set by your parent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Daily Screen Time Limit</p>
            <p className="text-2xl font-bold">{Number(schedule.dailyLimitMinutes)} minutes</p>
          </div>

          {schedule.allowedHours.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Allowed Time Windows
              </p>
              <div className="space-y-2">
                {schedule.allowedHours.map((window, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <Badge variant="outline">{DAYS[Number(window.dayOfWeek)]}</Badge>
                    <span className="text-sm">
                      {Number(window.startHour)}:00 - {Number(window.endHour)}:00
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
