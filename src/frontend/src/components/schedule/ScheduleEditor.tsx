import { useState, useEffect } from 'react';
import { useGetSchedule, useUpdateSchedule } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';
import type { ScheduleConfig, DayTimeWindow } from '../../backend';
import { useI18n } from '../../hooks/useI18n';

interface ScheduleEditorProps {
  childId: Principal;
}

export default function ScheduleEditor({ childId }: ScheduleEditorProps) {
  const { t } = useI18n();
  const { data: schedule } = useGetSchedule(childId);
  const updateSchedule = useUpdateSchedule();

  const [dailyLimit, setDailyLimit] = useState('120');
  const [windows, setWindows] = useState<DayTimeWindow[]>([]);

  const DAYS = [
    t('scheduleEditorDaySunday'),
    t('scheduleEditorDayMonday'),
    t('scheduleEditorDayTuesday'),
    t('scheduleEditorDayWednesday'),
    t('scheduleEditorDayThursday'),
    t('scheduleEditorDayFriday'),
    t('scheduleEditorDaySaturday'),
  ];

  useEffect(() => {
    if (schedule) {
      setDailyLimit(schedule.dailyLimitMinutes.toString());
      setWindows(schedule.allowedHours);
    }
  }, [schedule]);

  const handleSave = () => {
    const config: ScheduleConfig = {
      dailyLimitMinutes: BigInt(parseInt(dailyLimit) || 120),
      allowedHours: windows,
    };
    updateSchedule.mutate({ childId, config });
  };

  const addWindow = () => {
    setWindows([
      ...windows,
      {
        dayOfWeek: BigInt(1),
        startHour: BigInt(9),
        endHour: BigInt(17),
      },
    ]);
  };

  const removeWindow = (index: number) => {
    setWindows(windows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription className="text-sm">
          {t('scheduleEditorAlert')}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('scheduleEditorTitle')}</CardTitle>
          <CardDescription>{t('scheduleEditorDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="0"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="max-w-xs"
            />
            <span className="text-sm text-muted-foreground">{t('scheduleEditorMinutesPerDay')}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('scheduleEditorTimeWindows')}</CardTitle>
          <CardDescription>{t('scheduleEditorTimeWindowsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {windows.map((window, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">{t('scheduleEditorDay')}</Label>
                  <select
                    value={Number(window.dayOfWeek)}
                    onChange={(e) => {
                      const newWindows = [...windows];
                      newWindows[idx] = { ...window, dayOfWeek: BigInt(parseInt(e.target.value)) };
                      setWindows(newWindows);
                    }}
                    className="w-full p-2 border rounded text-sm"
                  >
                    {DAYS.map((day, i) => (
                      <option key={i} value={i}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">{t('scheduleEditorStart')}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={Number(window.startHour)}
                    onChange={(e) => {
                      const newWindows = [...windows];
                      newWindows[idx] = { ...window, startHour: BigInt(parseInt(e.target.value) || 0) };
                      setWindows(newWindows);
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs">{t('scheduleEditorEnd')}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={Number(window.endHour)}
                    onChange={(e) => {
                      const newWindows = [...windows];
                      newWindows[idx] = { ...window, endHour: BigInt(parseInt(e.target.value) || 0) };
                      setWindows(newWindows);
                    }}
                  />
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={() => removeWindow(idx)}>
                {t('scheduleEditorRemoveWindow')}
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addWindow} className="w-full">
            {t('scheduleEditorAddWindow')}
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={updateSchedule.isPending} className="w-full bg-amber-600 hover:bg-amber-700">
        {updateSchedule.isPending ? t('scheduleEditorSaving') : t('scheduleEditorSaveButton')}
      </Button>
    </div>
  );
}
