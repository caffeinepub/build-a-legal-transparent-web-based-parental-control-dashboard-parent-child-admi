import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface ConsentNoticeProps {
  type: 'activity' | 'location' | 'pairing';
}

export default function ConsentNotice({ type }: ConsentNoticeProps) {
  const messages = {
    activity: 'You are about to share activity information with your parent. This is completely voluntary and you can see everything that gets shared.',
    location: 'You are about to share your location with your parent. This is a one-time share, not continuous tracking. You control when and what to share.',
    pairing: 'By pairing with a parent, you agree to share information you voluntarily submit. Your parent will see activities and locations you choose to share. There is no hidden monitoring.',
  };

  return (
    <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
      <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
      <AlertDescription className="text-green-900 dark:text-green-100 text-sm">
        <strong>Transparency Notice:</strong> {messages[type]}
      </AlertDescription>
    </Alert>
  );
}
