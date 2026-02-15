import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Radio, Clock } from 'lucide-react';
import LocationHistoryList from '../child/LocationHistoryList';
import type { Principal } from '@icp-sdk/core/principal';
import { useGetLiveLocationSharingStatus, useGetLocations } from '../../hooks/useQueries';
import { useI18n } from '../../hooks/useI18n';

interface LocationViewProps {
  childId: Principal | null;
}

export default function LocationView({ childId }: LocationViewProps) {
  const { t } = useI18n();
  const { data: liveLocationEnabled = false } = useGetLiveLocationSharingStatus(childId, {
    refetchInterval: 10000, // Poll every 10 seconds
  });
  const { data: locations = [] } = useGetLocations(childId, {
    refetchInterval: liveLocationEnabled ? 15000 : undefined, // Poll every 15 seconds if live sharing is on
  });

  const getLastUpdateInfo = () => {
    if (locations.length === 0) return null;

    const sortedLocations = [...locations].sort((a, b) => Number(b.timestamp - a.timestamp));
    const lastLocation = sortedLocations[0];
    const lastUpdateTime = new Date(Number(lastLocation.timestamp) / 1_000_000);
    const now = new Date();
    const ageMinutes = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 60000);

    return {
      time: lastUpdateTime,
      ageMinutes,
      isRecent: ageMinutes < 5,
    };
  };

  const lastUpdate = getLastUpdateInfo();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {t('locationViewTitle')}
              </CardTitle>
              <CardDescription>{t('locationViewDescription')}</CardDescription>
            </div>
            {liveLocationEnabled && (
              <Badge variant="outline" className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                <Radio className="w-3 h-3 animate-pulse" />
                {t('liveLocationParentStatusEnabled')}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {liveLocationEnabled && (
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <Radio className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm space-y-2">
                <p className="font-semibold">{t('liveLocationParentActiveTitle')}</p>
                <p>{t('liveLocationParentActiveDescription')}</p>
                {lastUpdate && (
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>
                      {t('liveLocationParentLastUpdate')}: {lastUpdate.time.toLocaleString()} ({lastUpdate.ageMinutes}{' '}
                      {t('liveLocationParentMinutesAgo')})
                    </span>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {liveLocationEnabled && lastUpdate && !lastUpdate.isRecent && (
            <Alert variant="destructive">
              <Clock className="w-4 h-4" />
              <AlertDescription className="text-sm">{t('liveLocationParentStaleWarning')}</AlertDescription>
            </Alert>
          )}

          {!liveLocationEnabled && locations.length === 0 && (
            <Alert>
              <MapPin className="w-4 h-4" />
              <AlertDescription className="text-sm">{t('liveLocationParentDisabledNoData')}</AlertDescription>
            </Alert>
          )}

          <LocationHistoryList childId={childId} showTransparencyLabel />
        </CardContent>
      </Card>
    </div>
  );
}
