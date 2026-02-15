import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, MapPin, History } from 'lucide-react';
import LocationHistoryList from '../child/LocationHistoryList';
import LiveLocationMap from './LiveLocationMap';
import type { Principal } from '@icp-sdk/core/principal';
import { useI18n } from '../../hooks/useI18n';

interface LocationViewProps {
  childId: Principal;
}

export default function LocationView({ childId }: LocationViewProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'map' | 'history'>('map');

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
          This data was voluntarily submitted by your child with their explicit consent. No hidden monitoring occurs.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'map' | 'history')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t('locationViewTabMap')}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            {t('locationViewTabHistory')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-4">
          <LiveLocationMap childId={childId} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <LocationHistoryList childId={childId} showTransparencyLabel={true} refetchInterval={15000} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
