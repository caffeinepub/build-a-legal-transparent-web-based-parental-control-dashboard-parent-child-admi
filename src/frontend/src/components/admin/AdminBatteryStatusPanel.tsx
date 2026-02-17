import { useI18n } from '../../hooks/useI18n';
import { useGetAllDeviceBatteryStatuses } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Battery, BatteryCharging, BatteryLow, BatteryWarning } from 'lucide-react';

export default function AdminBatteryStatusPanel() {
  const { t } = useI18n();
  const { data: batteryStatuses, isLoading } = useGetAllDeviceBatteryStatuses();

  const getBatteryIcon = (percentage: number) => {
    if (percentage > 75) return Battery;
    if (percentage > 50) return BatteryCharging;
    if (percentage > 25) return BatteryLow;
    return BatteryWarning;
  };

  const getBatteryColor = (percentage: number) => {
    if (percentage > 75) return 'text-green-600 dark:text-green-400';
    if (percentage > 50) return 'text-blue-600 dark:text-blue-400';
    if (percentage > 25) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getBatteryBadgeVariant = (percentage: number): 'default' | 'secondary' | 'destructive' => {
    if (percentage > 50) return 'default';
    if (percentage > 25) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!batteryStatuses || batteryStatuses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('adminBatteryTitle')}</CardTitle>
          <CardDescription>{t('adminBatteryDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t('adminBatteryEmpty')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adminBatteryTitle')}</CardTitle>
        <CardDescription>{t('adminBatteryDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('adminBatteryColumnUser')}</TableHead>
              <TableHead>{t('adminBatteryColumnPercentage')}</TableHead>
              <TableHead>{t('adminBatteryColumnLastUpdated')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batteryStatuses.map(([principal, status]) => {
              const percentage = Number(status.batteryPercentage);
              const BatteryIcon = getBatteryIcon(percentage);
              const timestamp = new Date(Number(status.timestamp / BigInt(1_000_000)));
              
              return (
                <TableRow key={principal.toString()}>
                  <TableCell className="font-mono text-xs">
                    {principal.toString().slice(0, 20)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <BatteryIcon className={`h-5 w-5 ${getBatteryColor(percentage)}`} />
                      <Badge variant={getBatteryBadgeVariant(percentage)}>
                        {percentage}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {timestamp.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
