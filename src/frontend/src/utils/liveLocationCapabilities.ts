export interface LocationCapabilities {
  supportsGeolocation: boolean;
  supportsServiceWorker: boolean;
  supportsBackgroundSync: boolean;
  supportsPeriodicBackgroundSync: boolean;
  canRunInBackground: boolean;
  isPWAInstalled: boolean;
}

export function detectLocationCapabilities(): LocationCapabilities {
  const supportsGeolocation = 'geolocation' in navigator;
  const supportsServiceWorker = 'serviceWorker' in navigator;
  const supportsBackgroundSync = 'serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype;
  const supportsPeriodicBackgroundSync =
    'serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype;

  // Check if running as installed PWA
  const isPWAInstalled =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  // Background capability: PWA + service worker + background sync
  const canRunInBackground = isPWAInstalled && supportsServiceWorker && supportsBackgroundSync;

  return {
    supportsGeolocation,
    supportsServiceWorker,
    supportsBackgroundSync,
    supportsPeriodicBackgroundSync,
    canRunInBackground,
    isPWAInstalled,
  };
}

export function getCapabilityMessage(capabilities: LocationCapabilities, language: 'en' | 'pt-BR'): string {
  if (!capabilities.supportsGeolocation) {
    return language === 'en'
      ? 'Geolocation is not supported on this device.'
      : 'Geolocalização não é suportada neste dispositivo.';
  }

  if (capabilities.canRunInBackground) {
    return language === 'en'
      ? 'Background updates enabled. Location sharing will continue even when the app is in the background.'
      : 'Atualizações em segundo plano habilitadas. O compartilhamento de localização continuará mesmo quando o app estiver em segundo plano.';
  }

  if (capabilities.isPWAInstalled && capabilities.supportsServiceWorker) {
    return language === 'en'
      ? 'Background updates available but not fully supported. Updates will continue while the app is open or in a background tab.'
      : 'Atualizações em segundo plano disponíveis mas não totalmente suportadas. As atualizações continuarão enquanto o app estiver aberto ou em uma aba em segundo plano.';
  }

  return language === 'en'
    ? 'Location sharing works while the app is open. Install this app for better background support.'
    : 'O compartilhamento de localização funciona enquanto o app estiver aberto. Instale este app para melhor suporte em segundo plano.';
}
