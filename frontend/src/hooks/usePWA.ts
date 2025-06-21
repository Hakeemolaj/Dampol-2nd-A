'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isUpdateAvailable: false,
    installPrompt: null,
  });

  useEffect(() => {
    // Check if app is installed (running in standalone mode)
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;

    setPwaState(prev => ({ ...prev, isInstalled }));

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      
      setPwaState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: installEvent,
      }));
    };

    // Handle app installed
    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
    };

    // Handle online/offline status
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }));
    };

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      console.log('Service Worker registered:', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setPwaState(prev => ({ ...prev, isUpdateAvailable: true }));
            }
          });
        }
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATIONS_SYNCED') {
          // Handle notification sync
          console.log('Notifications synced:', event.data.data);
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const installApp = async () => {
    if (!pwaState.installPrompt) return false;

    try {
      await pwaState.installPrompt.prompt();
      const choiceResult = await pwaState.installPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setPwaState(prev => ({
          ...prev,
          isInstallable: false,
          installPrompt: null,
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to install app:', error);
      return false;
    }
  };

  const updateApp = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Subscribe to push notifications
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        
        if (!vapidPublicKey) {
          console.error('VAPID public key not configured');
          return null;
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  };

  const shareContent = async (data: { title: string; text: string; url?: string }) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        console.error('Failed to share:', error);
        return false;
      }
    } else {
      // Fallback to clipboard
      try {
        const shareText = `${data.title}\n${data.text}\n${data.url || window.location.href}`;
        await navigator.clipboard.writeText(shareText);
        return true;
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
      }
    }
  };

  const addToHomeScreen = () => {
    // For iOS Safari
    if ((navigator as any).standalone === false) {
      return {
        isIOS: true,
        message: 'To install this app on your iOS device, tap the share button and then "Add to Home Screen".',
      };
    }

    // For other browsers, use the install prompt
    if (pwaState.installPrompt) {
      return {
        isIOS: false,
        canInstall: true,
      };
    }

    return {
      isIOS: false,
      canInstall: false,
      message: 'This app is already installed or cannot be installed on this device.',
    };
  };

  const cacheResources = async (urls: string[]) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_URLS',
        urls,
      });
    }
  };

  return {
    ...pwaState,
    installApp,
    updateApp,
    requestNotificationPermission,
    subscribeToPushNotifications,
    shareContent,
    addToHomeScreen,
    cacheResources,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
