import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, MapPin, Users } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

interface ConsentNoticeProps {
  type: 'activity' | 'location' | 'pairing';
}

export default function ConsentNotice({ type }: ConsentNoticeProps) {
  const { t } = useI18n();

  const config = {
    activity: {
      icon: Shield,
      title: t('consentActivityTitle'),
      description: t('consentActivityDescription'),
    },
    location: {
      icon: MapPin,
      title: t('consentLocationTitle'),
      description: t('consentLocationDescription'),
    },
    pairing: {
      icon: Users,
      title: t('consentPairingTitle'),
      description: t('consentPairingDescription'),
    },
  };

  const { icon: Icon, title, description } = config[type];

  return (
    <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
      <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-amber-900 dark:text-amber-100 text-sm space-y-2">
        <p className="font-semibold">{title}</p>
        <p>{description}</p>
      </AlertDescription>
    </Alert>
  );
}
