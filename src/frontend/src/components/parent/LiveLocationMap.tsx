import { useGetLocations, useGetLiveLocationSharingStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Radio } from 'lucide-react';
import type { Principal } from '@icp-sdk/core/principal';
import { useI18n } from '../../hooks/useI18n';

interface LiveLocationMapProps {
  childId: Principal;
}

export default function LiveLocationMap({ childId }: LiveLocationMapProps) {
  const { t } = useI18n();
  const { data: locations = [], isLoading } = useGetLocations(childId, { refetchInterval: 10000 });
  const { data: isLiveSharing = false } = useGetLiveLocationSharingStatus(childId, { refetchInterval: 10000 });

  const latestLocation = locations.length > 0 ? locations[locations.length - 1] : null;

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const getTimeAgo = (timestamp: bigint) => {
    const now = Date.now();
    const then = Number(timestamp) / 1_000_000;
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return t('locationViewJustNow');
    if (diffMins === 1) return t('locationView1MinuteAgo');
    if (diffMins < 60) return t('locationViewMinutesAgo', { minutes: diffMins });
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return t('locationView1HourAgo');
    if (diffHours < 24) return t('locationViewHoursAgo', { hours: diffHours });
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return t('locationView1DayAgo');
    return t('locationViewDaysAgo', { days: diffDays });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground">{t('loading')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestLocation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {t('locationViewMapTitle')}
          </CardTitle>
          <CardDescription>{t('locationViewMapDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
            <div className="text-center space-y-2">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">{t('locationViewNoLocation')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeAgo = getTimeAgo(latestLocation.timestamp);
  const isStale = Number(latestLocation.timestamp) / 1_000_000 < Date.now() - 15 * 60 * 1000;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t('locationViewMapTitle')}
            </CardTitle>
            <CardDescription>{t('locationViewMapDescription')}</CardDescription>
          </div>
          {isLiveSharing && (
            <Badge variant="outline" className="flex items-center gap-1 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
              <Radio className="w-3 h-3 animate-pulse" />
              {t('liveLocationParentStatusEnabled')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800" style={{ height: '400px' }}>
          {/* Simple coordinate-based map visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Grid background */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-navy-400 dark:text-navy-600" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              {/* Marker */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                <div className="relative">
                  {/* Pulse animation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full opacity-20 animate-ping"></div>
                  </div>
                  {/* Pin */}
                  <div className="relative z-10">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#EF4444"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Coordinates overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('locationViewLatitude')}:</span>
                    <span className="ml-2 font-mono font-semibold">{latestLocation.latitude.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t('locationViewLongitude')}:</span>
                    <span className="ml-2 font-mono font-semibold">{latestLocation.longitude.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{t('locationViewLastUpdate')}:</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{timeAgo}</div>
              <div className="text-xs text-muted-foreground">{formatTimestamp(latestLocation.timestamp)}</div>
            </div>
          </div>

          {isStale && (
            <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded p-2">
              {t('locationViewStaleWarning')}
            </div>
          )}

          <div className="text-xs text-muted-foreground pt-2 border-t">
            {t('locationViewMapNote')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
