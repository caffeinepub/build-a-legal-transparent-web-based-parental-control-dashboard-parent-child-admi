import { useGetLocations } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import type { Principal } from '@icp-sdk/core/principal';

interface LocationHistoryListProps {
  childId: Principal | null;
  showTransparencyLabel?: boolean;
  refetchInterval?: number;
}

export default function LocationHistoryList({ childId, showTransparencyLabel = false, refetchInterval }: LocationHistoryListProps) {
  const { identity } = useInternetIdentity();
  const effectiveChildId = childId || (identity ? identity.getPrincipal() : null);
  const { data: locations = [], isLoading } = useGetLocations(effectiveChildId, { refetchInterval });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading locations...</div>;
  }

  if (locations.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No locations submitted yet</div>;
  }

  const sortedLocations = [...locations].sort((a, b) => Number(b.timestamp - a.timestamp));

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
              <TableHead>Latitude</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLocations.map((location, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono">{location.latitude.toFixed(6)}</TableCell>
                <TableCell className="font-mono">{location.longitude.toFixed(6)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(Number(location.timestamp) / 1_000_000).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
