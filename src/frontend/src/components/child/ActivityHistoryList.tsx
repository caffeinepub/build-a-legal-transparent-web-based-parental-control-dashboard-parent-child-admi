import { useGetActivities } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import type { Principal } from '@icp-sdk/core/principal';

interface ActivityHistoryListProps {
  childId: Principal | null;
  showTransparencyLabel?: boolean;
  refetchInterval?: number;
}

export default function ActivityHistoryList({ childId, showTransparencyLabel = false, refetchInterval }: ActivityHistoryListProps) {
  const { identity } = useInternetIdentity();
  const effectiveChildId = childId || (identity ? identity.getPrincipal() : null);
  const { data: activities = [], isLoading } = useGetActivities(effectiveChildId, { refetchInterval });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading activities...</div>;
  }

  if (activities.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No activities submitted yet</div>;
  }

  const sortedActivities = [...activities].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="space-y-4">
      {showTransparencyLabel && (
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
          Voluntarily shared by child
        </Badge>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App/Site</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedActivities.map((activity, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{activity.appSite}</TableCell>
                <TableCell>{Number(activity.durationMinutes)} min</TableCell>
                <TableCell className="text-muted-foreground">{activity.notes || '-'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(Number(activity.timestamp) / 1_000_000).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
