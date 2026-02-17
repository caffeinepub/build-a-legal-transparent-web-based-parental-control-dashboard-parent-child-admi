import { useI18n } from '../../hooks/useI18n';
import { useGetParentUsersCount, useGetChildUsersCount, useGetAdminDashboardMetrics } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Baby, Activity, Battery, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type AdminSection = 'overview' | 'parents' | 'children' | 'analytics' | 'battery';

interface AdminOverviewCardsProps {
  onNavigate: (section: AdminSection) => void;
}

export default function AdminOverviewCards({ onNavigate }: AdminOverviewCardsProps) {
  const { t } = useI18n();
  const { data: parentCount, isLoading: parentLoading } = useGetParentUsersCount();
  const { data: childCount, isLoading: childLoading } = useGetChildUsersCount();
  const { data: metrics, isLoading: metricsLoading } = useGetAdminDashboardMetrics();

  if (parentLoading || childLoading || metricsLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const overviewCards = [
    {
      title: t('adminOverviewParentsTitle'),
      value: Number(parentCount || 0),
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      action: () => onNavigate('parents'),
    },
    {
      title: t('adminOverviewChildrenTitle'),
      value: Number(childCount || 0),
      icon: Baby,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      action: () => onNavigate('children'),
    },
    {
      title: t('adminOverviewActiveSessionsTitle'),
      value: Number(metrics?.activeSessionsEstimate || 0),
      icon: Activity,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      action: () => onNavigate('analytics'),
    },
    {
      title: t('adminOverviewBatteryTitle'),
      value: t('adminOverviewBatteryValue'),
      icon: Battery,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20',
      action: () => onNavigate('battery'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{card.value}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={card.action}
                  className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
                >
                  {t('adminOverviewViewDetails')} <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminOverviewSystemHealthTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">{t('adminOverviewTotalLinks')}</div>
              <div className="text-2xl font-bold">{Number(metrics?.totalParentChildLinks || 0)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('adminOverviewPendingPairings')}</div>
              <div className="text-2xl font-bold">{Number(metrics?.totalPendingPairings || 0)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t('adminOverviewDisabledAccounts')}</div>
              <div className="text-2xl font-bold">{Number(metrics?.totalDisabledAccounts || 0)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
