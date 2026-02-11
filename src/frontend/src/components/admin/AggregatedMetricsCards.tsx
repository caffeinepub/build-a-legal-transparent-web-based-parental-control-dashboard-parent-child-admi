import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Link2, TrendingUp } from 'lucide-react';

interface AggregatedMetricsCardsProps {
  metrics: {
    totalUsers: bigint;
    totalParents: bigint;
    totalChildren: bigint;
    totalPairings: bigint;
  } | null | undefined;
}

export default function AggregatedMetricsCards({ metrics }: AggregatedMetricsCardsProps) {
  if (!metrics) {
    return null;
  }

  const cards = [
    {
      title: 'Total Users',
      value: Number(metrics.totalUsers),
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Parents',
      value: Number(metrics.totalParents),
      icon: UserCheck,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Children',
      value: Number(metrics.totalChildren),
      icon: Users,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Pairings',
      value: Number(metrics.totalPairings),
      icon: Link2,
      color: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
