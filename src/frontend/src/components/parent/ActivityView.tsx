import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import ActivityHistoryList from '../child/ActivityHistoryList';
import type { Principal } from '@icp-sdk/core/principal';

interface ActivityViewProps {
  childId: Principal;
}

export default function ActivityView({ childId }: ActivityViewProps) {
  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
          This data was voluntarily submitted by your child with their explicit consent. No hidden monitoring occurs.
        </AlertDescription>
      </Alert>
      <ActivityHistoryList childId={childId} showTransparencyLabel={true} />
    </div>
  );
}
