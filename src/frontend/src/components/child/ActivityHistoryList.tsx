import { useGetActivities } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

interface ActivityHistoryListProps {
  childId: Principal | null;
  showTransparencyLabel: boolean;
}

export default function ActivityHistoryList({ childId, showTransparencyLabel }: ActivityHistoryListProps) {
  const { data: activities = [], isLoading } = useGetActivities(childId);

  if (isLoading) {
    return <p className="text-muted-foreground text-center py-8">Loading...</p>;
  }

  if (activities.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No activities submitted yet</p>;
  }

  const sortedActivities = [...activities].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="space-y-4">
      {showTransparencyLabel && (
        <Badge variant="outline" className="text-xs">
          Child-submitted data with consent
        </Badge>
      )}
      <div className="border rounded-lg">
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
            {sortedActivities.map((activity, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{activity.appSite}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{Number(activity.durationMinutes)} min</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {activity.notes || '—'}
                </TableCell>
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
