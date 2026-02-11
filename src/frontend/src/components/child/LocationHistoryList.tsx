import { useGetLocations } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

interface LocationHistoryListProps {
  childId: Principal | null;
  showTransparencyLabel: boolean;
}

export default function LocationHistoryList({ childId, showTransparencyLabel }: LocationHistoryListProps) {
  const { data: locations = [], isLoading } = useGetLocations(childId);

  if (isLoading) {
    return <p className="text-muted-foreground text-center py-8">Loading...</p>;
  }

  if (locations.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No locations shared yet</p>;
  }

  const sortedLocations = [...locations].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="space-y-4">
      {showTransparencyLabel && (
        <Badge variant="outline" className="text-xs">
          Child-submitted data with explicit consent
        </Badge>
      )}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coordinates</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLocations.map((location, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-mono">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </span>
                  </div>
                </TableCell>
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
