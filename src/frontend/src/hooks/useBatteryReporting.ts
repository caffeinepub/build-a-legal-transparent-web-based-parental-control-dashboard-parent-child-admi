import { useEffect, useRef } from 'react';
import { useUpdateDeviceBatteryStatus } from './useQueries';
import { useInternetIdentity } from './useInternetIdentity';

const BATTERY_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useBatteryReporting() {
  const { identity } = useInternetIdentity();
  const updateBattery = useUpdateDeviceBatteryStatus();
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!identity) return;

    const reportBattery = async () => {
      try {
        // Check if Battery Status API is available
        if (!('getBattery' in navigator)) {
          return;
        }

        const battery = await (navigator as any).getBattery();
        const percentage = Math.round(battery.level * 100);

        // Throttle updates
        const now = Date.now();
        if (now - lastUpdateRef.current < BATTERY_UPDATE_INTERVAL) {
          return;
        }

        lastUpdateRef.current = now;

        await updateBattery.mutateAsync({
          batteryPercentage: BigInt(percentage),
          timestamp: BigInt(now) * BigInt(1_000_000),
        });
      } catch (error) {
        // Silently fail - battery reporting is optional
        console.debug('Battery reporting failed:', error);
      }
    };

    // Report immediately
    reportBattery();

    // Set up periodic reporting
    const interval = setInterval(reportBattery, BATTERY_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [identity, updateBattery]);
}
