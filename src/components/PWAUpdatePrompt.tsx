import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onNeedRefresh() {
      // triggered automatically when a new SW is waiting
    },
    onRegisteredSW(_swUrl, r) {
      // Poll for updates every 60 s while online
      if (r) {
        setInterval(() => {
          if (navigator.onLine) r.update();
        }, 60 * 1000);
      }
    },
  });

  useEffect(() => {
    if (!needRefresh) return;
    toast('Nouvelle version disponible', {
      description: 'Une mise à jour est prête. Cliquez pour appliquer.',
      duration: Infinity,
      action: {
        label: 'Mettre à jour',
        onClick: () => updateServiceWorker(true),
      },
    });
  }, [needRefresh]);

  return null;
}
