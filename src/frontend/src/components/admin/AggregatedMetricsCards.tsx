import { useGetAdminDashboardMetrics } from '../../hooks/useQueries';
import { useI18n } from '../../hooks/useI18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Baby, Link, Activity, UserX, Clock, Settings, Filter, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AggregatedMetricsCards() {
  const { data: metrics, isLoading } = useGetAdminDashboardMetrics();
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(10)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const metricCards = [
    {
      title: t('adminMetricsTotalUsers'),
      value: Number(metrics.totalUsersEverLoggedIn),
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: t('adminMetricsTotalParents'),
      value: Number(metrics.totalParents),
      icon: UserCheck,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: t('adminMetricsTotalChildren'),
      value: Number(metrics.totalChildren),
      icon: Baby,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: t('adminMetricsTotalAdmins'),
      value: Number(metrics.totalAdmins),
      icon: Shield,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: t('adminMetricsTotalLinks'),
      value: Number(metrics.totalParentChildLinks),
      icon: Link,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: t('adminMetricsActiveSessions'),
      value: Number(metrics.activeSessionsEstimate),
      icon: Activity,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: t('adminMetricsPendingPairings'),
      value: Number(metrics.totalPendingPairings),
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: t('adminMetricsDisabledAccounts'),
      value: Number(metrics.totalDisabledAccounts),
      icon: UserX,
      color: 'text-red-600 dark:text-red-400',
    },
    {
      title: t('adminMetricsSchedulesConfigured'),
      value: Number(metrics.totalSchedulesConfigured),
      icon: Settings,
      color: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      title: t('adminMetricsFiltersConfigured'),
      value: Number(metrics.totalContentFiltersConfigured),
      icon: Filter,
      color: 'text-pink-600 dark:text-pink-400',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
