import { useEffect, useRef } from 'react';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

const HEARTBEAT_INTERVAL = 120000; // 2 minutes

export function usePresenceHeartbeat() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!actor || !identity) {
      // Clear interval if not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Send initial heartbeat
    const sendHeartbeat = async () => {
      try {
        await actor.recordHeartbeat();
      } catch (error) {
        // Silently fail - heartbeat is best-effort
        console.debug('Heartbeat failed:', error);
      }
    };

    sendHeartbeat();

    // Set up periodic heartbeat
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Send heartbeat on visibility change (tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [actor, identity]);
}
