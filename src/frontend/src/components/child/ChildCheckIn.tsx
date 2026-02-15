import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useAddActivity, useAddLocation, useSetLiveLocationSharing, useGetLiveLocationSharingStatus } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Info, MapPin, Activity, Radio } from 'lucide-react';
import ConsentNotice from './ConsentNotice';
import { toast } from 'sonner';
import { useI18n } from '../../hooks/useI18n';
import { useLiveLocationSharing } from '../../hooks/useLiveLocationSharing';
import { detectLocationCapabilities } from '../../utils/liveLocationCapabilities';

export default function ChildCheckIn() {
  const { t } = useI18n();
  const { identity } = useInternetIdentity();
  const childId = identity?.getPrincipal();

  // Activity form state
  const [appSite, setAppSite] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  // Location form state
  const [place, setPlace] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const addActivity = useAddActivity();
  const addLocation = useAddLocation({ silent: true });
  const setLiveSharing = useSetLiveLocationSharing();
  const { data: isLiveSharing = false } = useGetLiveLocationSharingStatus(childId || null);

  // Live location sharing hook
  useLiveLocationSharing({ enabled: isLiveSharing });

  const handleActivitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appSite || !duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    await addActivity.mutateAsync({
      appSite,
      durationMinutes: BigInt(parseInt(duration)),
      notes,
    });

    // Reset form
    setAppSite('');
    setDuration('');
    setNotes('');
  };

  const handleManualLocationSubmit = async () => {
    setIsSubmittingManual(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      await addLocation.mutateAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      toast.success(t('childCheckInLocationManualSuccess'));
      setPlace('');
    } catch (error: any) {
      console.error('Location error:', error);
      toast.error(t('childCheckInLocationManualError'));
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const handleLiveSharingToggle = async (enabled: boolean) => {
    try {
      await setLiveSharing.mutateAsync(enabled);
      if (enabled) {
        toast.success('Live location sharing enabled');
      } else {
        toast.success('Live location sharing disabled');
      }
    } catch (error: any) {
      toast.error(`Failed to update live sharing: ${error.message}`);
    }
  };

  const capabilities = detectLocationCapabilities();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('childCheckInTitle')}</CardTitle>
        <CardDescription>{t('childCheckInDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-2" />
              {t('childCheckInTabActivity')}
            </TabsTrigger>
            <TabsTrigger value="location">
              <MapPin className="w-4 h-4 mr-2" />
              {t('childCheckInTabLocation')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <form onSubmit={handleActivitySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appSite">{t('childCheckInActivityAppLabel')}</Label>
                <Input
                  id="appSite"
                  placeholder={t('childCheckInActivityAppPlaceholder')}
                  value={appSite}
                  onChange={(e) => setAppSite(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">{t('childCheckInActivityDurationLabel')}</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder={t('childCheckInActivityDurationPlaceholder')}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('childCheckInActivityNotesLabel')}</Label>
                <Textarea
                  id="notes"
                  placeholder={t('childCheckInActivityNotesPlaceholder')}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <ConsentNotice type="activity" />

              <Button type="submit" className="w-full" disabled={addActivity.isPending}>
                {addActivity.isPending ? t('childCheckInActivitySubmitting') : t('childCheckInActivitySubmitButton')}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            {/* Live Location Sharing */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${isLiveSharing ? 'text-green-600 animate-pulse' : 'text-muted-foreground'}`} />
                    <Label htmlFor="live-sharing" className="font-semibold">
                      {t('childCheckInLocationTitle')}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('childCheckInLocationManualDescription')}
                  </p>
                </div>
                <Switch
                  id="live-sharing"
                  checked={isLiveSharing}
                  onCheckedChange={handleLiveSharingToggle}
                  disabled={setLiveSharing.isPending}
                />
              </div>

              {/* Capability warnings */}
              {!capabilities.supportsGeolocation && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Geolocation is not supported on this device
                  </AlertDescription>
                </Alert>
              )}

              {capabilities.supportsGeolocation && !capabilities.supportsServiceWorker && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Background updates require service worker support
                  </AlertDescription>
                </Alert>
              )}

              {capabilities.supportsGeolocation && capabilities.supportsServiceWorker && !capabilities.supportsBackgroundSync && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Background sync is not available on this device
                  </AlertDescription>
                </Alert>
              )}

              {isLiveSharing && (
                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <Radio className="h-4 w-4 text-green-600 animate-pulse" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Live location sharing is active
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Manual Location Submission */}
            <div className="pt-4 border-t space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-1">{t('childCheckInLocationManualTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('childCheckInLocationManualDescription')}</p>
              </div>

              <ConsentNotice type="location" />

              <Button
                onClick={handleManualLocationSubmit}
                className="w-full"
                disabled={isSubmittingManual}
                variant="outline"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {isSubmittingManual ? t('childCheckInLocationManualSubmitting') : t('childCheckInLocationManualSubmit')}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
