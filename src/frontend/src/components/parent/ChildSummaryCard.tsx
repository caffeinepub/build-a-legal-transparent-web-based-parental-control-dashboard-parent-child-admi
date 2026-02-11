import { useGetActivities, useGetLocations } from '../../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, AlertCircle } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';

interface ChildSummaryCardProps {
  childId: Principal;
  isSelected: boolean;
  onSelect: () => void;
}

export default function ChildSummaryCard({ childId, isSelected, onSelect }: ChildSummaryCardProps) {
  const { data: activities = [] } = useGetActivities(childId);
  const { data: locations = [] } = useGetLocations(childId);

  const lastActivity = activities[activities.length - 1];
  const lastCheckIn = lastActivity ? new Date(Number(lastActivity.timestamp) / 1_000_000) : null;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-amber-500 shadow-md' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-sm">Child Account</p>
            <p className="text-xs font-mono text-muted-foreground">
              {childId.toString().slice(0, 12)}...
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {activities.length} activities
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-xs">
              {lastCheckIn
                ? `Last check-in: ${lastCheckIn.toLocaleDateString()}`
                : 'No check-ins yet'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-xs">{locations.length} locations shared</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
