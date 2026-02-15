import { useEffect, useRef, useState } from 'react';
import { useAddLocation } from './useQueries';
import { locationQueue } from '../utils/locationUpdateQueue';
import { requestBackgroundSync } from '../pwa/registerServiceWorker';

interface UseLiveLocationSharingOptions {
  enabled: boolean;
  intervalMs?: number;
}

interface UseLiveLocationSharingReturn {
  isSharing: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export function useLiveLocationSharing({
  enabled,
  intervalMs = 30000, // 30 seconds default
}: UseLiveLocationSharingOptions): UseLiveLocationSharingReturn {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const addLocation = useAddLocation({ silent: true });
  const isVisibleRef = useRef(true);

  const captureAndSubmitLocation = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      try {
        await addLocation.mutateAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLastUpdate(new Date());
        setError(null);
      } catch (submitError: any) {
        // Queue for later retry if submission fails
        console.warn('Failed to submit location, queueing for retry:', submitError);
        locationQueue.enqueue(position.coords.latitude, position.coords.longitude);
        
        // Request background sync if available
        requestBackgroundSync('location-sync').catch((err) => {
          console.warn('Background sync not available:', err);
        });

        // Don't set error or stop sharing - this is a transient failure
        setLastUpdate(new Date());
      }
    } catch (err: any) {
      // Only set error for geolocation failures
      if (err.code === 1) {
        setError('permission_denied');
      } else if (err.code === 2) {
        setError('position_unavailable');
      } else if (err.code === 3) {
        setError('timeout');
      } else {
        setError('unknown_error');
      }
      // Don't stop sharing on transient errors
    }
  };

  // Process queued updates
  const processQueue = async () => {
    while (!locationQueue.isEmpty()) {
      const update = locationQueue.peek();
      if (!update) break;

      try {
        await addLocation.mutateAsync({
          latitude: update.latitude,
          longitude: update.longitude,
        });
        locationQueue.dequeue();
      } catch (error) {
        console.warn('Failed to process queued update:', error);
        locationQueue.incrementRetry(update);
        break; // Stop processing on failure
      }
    }
  };

  useEffect(() => {
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      
      if (!document.hidden && enabled) {
        // Page became visible - process queue
        processQueue();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      // Check permission first
      if (!navigator.geolocation) {
        setError('not_supported');
        setIsSharing(false);
        return;
      }

      // Start sharing
      setIsSharing(true);
      setError(null);

      // Process any queued updates first
      processQueue();

      // Capture immediately
      captureAndSubmitLocation();

      // Set up interval for periodic updates
      intervalRef.current = setInterval(() => {
        captureAndSubmitLocation();
      }, intervalMs);

      // Also use watchPosition for more responsive updates
      if (navigator.geolocation.watchPosition) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            // Only submit if enough time has passed
            if (!lastUpdate || Date.now() - lastUpdate.getTime() > intervalMs / 2) {
              addLocation.mutate({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              setLastUpdate(new Date());
            }
          },
          (err) => {
            console.warn('Watch position error:', err);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 5000,
          }
        );
      }
    } else {
      // Stop sharing
      setIsSharing(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      // Clear queue when disabled
      locationQueue.clear();
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, intervalMs]);

  return {
    isSharing,
    error,
    lastUpdate,
  };
}
