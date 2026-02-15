import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, MapPin, Info } from 'lucide-react';
import { useAddActivity, useAddLocation } from '../../hooks/useQueries';
import ConsentNotice from './ConsentNotice';

export default function ChildCheckIn() {
  const [activityApp, setActivityApp] = useState('');
  const [activityDuration, setActivityDuration] = useState('');
  const [activityNotes, setActivityNotes] = useState('');
  const [activityConsent, setActivityConsent] = useState(false);

  const [locationPlace, setLocationPlace] = useState('');
  const [locationLat, setLocationLat] = useState('');
  const [locationLng, setLocationLng] = useState('');
  const [locationConsent, setLocationConsent] = useState(false);

  const addActivity = useAddActivity({ silent: true });
  const addLocation = useAddLocation({ silent: true });

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityConsent) {
      return;
    }

    addActivity.mutate(
      {
        appSite: activityApp,
        durationMinutes: BigInt(parseInt(activityDuration) || 0),
        notes: activityNotes,
      },
      {
        onSuccess: () => {
          setActivityApp('');
          setActivityDuration('');
          setActivityNotes('');
          setActivityConsent(false);
        },
      }
    );
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationConsent) {
      return;
    }

    addLocation.mutate(
      {
        latitude: parseFloat(locationLat) || 0,
        longitude: parseFloat(locationLng) || 0,
      },
      {
        onSuccess: () => {
          setLocationPlace('');
          setLocationLat('');
          setLocationLng('');
          setLocationConsent(false);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check-in</CardTitle>
        <CardDescription>
          Share your activity or location with your parent (requires your consent)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4">
            <ConsentNotice type="activity" />
            <form onSubmit={handleActivitySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app">App or Website *</Label>
                <Input
                  id="app"
                  value={activityApp}
                  onChange={(e) => setActivityApp(e.target.value)}
                  placeholder="e.g., YouTube, Instagram, Homework"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={activityDuration}
                  onChange={(e) => setActivityDuration(e.target.value)}
                  placeholder="30"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={activityNotes}
                  onChange={(e) => setActivityNotes(e.target.value)}
                  placeholder="What were you doing?"
                  rows={3}
                />
              </div>

              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
                  <strong>What will be shared:</strong> App/site name, duration, notes, and timestamp
                </AlertDescription>
              </Alert>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="activity-consent"
                  checked={activityConsent}
                  onCheckedChange={(checked) => setActivityConsent(checked as boolean)}
                />
                <Label htmlFor="activity-consent" className="text-sm leading-relaxed cursor-pointer">
                  I consent to sharing this activity information with my parent. I understand this is voluntary and transparent.
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-navy-600 hover:bg-navy-700 text-white"
                disabled={!activityConsent || addActivity.isPending}
              >
                {addActivity.isPending ? 'Submitting...' : 'Submit Activity'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <ConsentNotice type="location" />
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="place">Place Name (optional)</Label>
                <Input
                  id="place"
                  value={locationPlace}
                  onChange={(e) => setLocationPlace(e.target.value)}
                  placeholder="e.g., School, Library, Home"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={locationLat}
                    onChange={(e) => setLocationLat(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={locationLng}
                    onChange={(e) => setLocationLng(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
              </div>

              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-900 dark:text-blue-100 text-sm">
                  <strong>What will be shared:</strong> Coordinates and timestamp (no background tracking)
                </AlertDescription>
              </Alert>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="location-consent"
                  checked={locationConsent}
                  onCheckedChange={(checked) => setLocationConsent(checked as boolean)}
                />
                <Label htmlFor="location-consent" className="text-sm leading-relaxed cursor-pointer">
                  I consent to sharing this location with my parent. I understand this is a one-time share, not continuous tracking.
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-navy-600 hover:bg-navy-700 text-white"
                disabled={!locationConsent || addLocation.isPending}
              >
                {addLocation.isPending ? 'Submitting...' : 'Share Location'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
