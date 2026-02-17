import { useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useGetLoginCountByDay, useGetLoginCountByMonth, useGetLoginCountByYear } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type AnalyticsScope = 'day' | 'month' | 'year';

export default function AdminLoginAnalyticsPanel() {
  const { t } = useI18n();
  const [scope, setScope] = useState<AnalyticsScope>('day');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());

  const { data: dayCount, isLoading: dayLoading, refetch: refetchDay } = useGetLoginCountByDay(
    BigInt(year),
    BigInt(month),
    BigInt(day)
  );
  const { data: monthCount, isLoading: monthLoading, refetch: refetchMonth } = useGetLoginCountByMonth(
    BigInt(year),
    BigInt(month)
  );
  const { data: yearCount, isLoading: yearLoading, refetch: refetchYear } = useGetLoginCountByYear(
    BigInt(year)
  );

  const handleRefresh = () => {
    if (scope === 'day') refetchDay();
    else if (scope === 'month') refetchMonth();
    else refetchYear();
  };

  const getCount = () => {
    if (scope === 'day') return dayCount;
    if (scope === 'month') return monthCount;
    return yearCount;
  };

  const isLoading = scope === 'day' ? dayLoading : scope === 'month' ? monthLoading : yearLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('adminAnalyticsTitle')}
            </CardTitle>
            <CardDescription>{t('adminAnalyticsDescription')}</CardDescription>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            {t('adminAnalyticsRefresh')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={scope} onValueChange={(v) => setScope(v as AnalyticsScope)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">{t('adminAnalyticsScopeDay')}</TabsTrigger>
            <TabsTrigger value="month">{t('adminAnalyticsScopeMonth')}</TabsTrigger>
            <TabsTrigger value="year">{t('adminAnalyticsScopeYear')}</TabsTrigger>
          </TabsList>

          <TabsContent value="day" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="day-year">{t('adminAnalyticsLabelYear')}</Label>
                <Input
                  id="day-year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                  min={2020}
                  max={2100}
                />
              </div>
              <div>
                <Label htmlFor="day-month">{t('adminAnalyticsLabelMonth')}</Label>
                <Input
                  id="day-month"
                  type="number"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value) || 1)}
                  min={1}
                  max={12}
                />
              </div>
              <div>
                <Label htmlFor="day-day">{t('adminAnalyticsLabelDay')}</Label>
                <Input
                  id="day-day"
                  type="number"
                  value={day}
                  onChange={(e) => setDay(parseInt(e.target.value) || 1)}
                  min={1}
                  max={31}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="month" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="month-year">{t('adminAnalyticsLabelYear')}</Label>
                <Input
                  id="month-year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                  min={2020}
                  max={2100}
                />
              </div>
              <div>
                <Label htmlFor="month-month">{t('adminAnalyticsLabelMonth')}</Label>
                <Input
                  id="month-month"
                  type="number"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value) || 1)}
                  min={1}
                  max={12}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="year" className="space-y-4">
            <div>
              <Label htmlFor="year-year">{t('adminAnalyticsLabelYear')}</Label>
              <Input
                id="year-year"
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                min={2020}
                max={2100}
                className="max-w-xs"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-6 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            {t('adminAnalyticsResultLabel')}
          </div>
          {isLoading ? (
            <Skeleton className="h-12 w-32" />
          ) : (
            <div className="text-4xl font-bold">{Number(getCount() || 0)}</div>
          )}
          <div className="text-sm text-muted-foreground mt-1">
            {scope === 'day' && t('adminAnalyticsResultDay', { year, month, day })}
            {scope === 'month' && t('adminAnalyticsResultMonth', { year, month })}
            {scope === 'year' && t('adminAnalyticsResultYear', { year })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
