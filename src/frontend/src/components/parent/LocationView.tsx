import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import LocationHistoryList from '../child/LocationHistoryList';
import type { Principal } from '@icp-sdk/core/principal';

interface LocationViewProps {
  childId: Principal;
}

export default function LocationView({ childId }: LocationViewProps) {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
          Each location was shared by your child with explicit consent at the time of submission.
        </AlertDescription>
      </Alert>
      <LocationHistoryList childId={childId} showTransparencyLabel={true} />
    </div>
  );
}
