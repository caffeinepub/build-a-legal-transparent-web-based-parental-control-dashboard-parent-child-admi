export interface ServiceWorkerStatus {
  registered: boolean;
  supportsBackgroundSync: boolean;
  supportsPeriodicSync: boolean;
  error?: string;
}

// Extend ServiceWorkerRegistration interface for background sync
interface SyncManager {
  register(tag: string): Promise<void>;
}

interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync?: SyncManager;
  periodicSync?: {
    register(tag: string, options: { minInterval: number }): Promise<void>;
  };
}

let registration: ExtendedServiceWorkerRegistration | null = null;

export async function registerServiceWorker(): Promise<ServiceWorkerStatus> {
  if (!('serviceWorker' in navigator)) {
    return {
      registered: false,
      supportsBackgroundSync: false,
      supportsPeriodicSync: false,
      error: 'Service Worker not supported',
    };
  }

  try {
    registration = (await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })) as ExtendedServiceWorkerRegistration;

    console.log('Service Worker registered:', registration);

    const supportsBackgroundSync = 'sync' in registration;
    const supportsPeriodicSync = 'periodicSync' in registration;

    return {
      registered: true,
      supportsBackgroundSync,
      supportsPeriodicSync,
    };
  } catch (error: any) {
    console.error('Service Worker registration failed:', error);
    return {
      registered: false,
      supportsBackgroundSync: false,
      supportsPeriodicSync: false,
      error: error.message,
    };
  }
}

export async function requestBackgroundSync(tag: string): Promise<boolean> {
  if (!registration || !registration.sync) {
    return false;
  }

  try {
    await registration.sync.register(tag);
    return true;
  } catch (error) {
    console.error('Background sync registration failed:', error);
    return false;
  }
}

export async function requestPeriodicBackgroundSync(tag: string, minInterval: number): Promise<boolean> {
  if (!registration || !registration.periodicSync) {
    return false;
  }

  try {
    await registration.periodicSync.register(tag, {
      minInterval,
    });
    return true;
  } catch (error) {
    console.error('Periodic background sync registration failed:', error);
    return false;
  }
}

export function getRegistration(): ExtendedServiceWorkerRegistration | null {
  return registration;
}
