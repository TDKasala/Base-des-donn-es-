import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onNeedRefresh() {},
    onRegisteredSW(_swUrl, r) {
      if (!r) return;

      // Check on focus (user returns to tab)
      const checkOnFocus = () => { if (navigator.onLine) r.update(); };
      window.addEventListener('focus', checkOnFocus);

      // Check every 30 seconds
      const interval = setInterval(() => {
        if (navigator.onLine) r.update();
      }, 30 * 1000);

      // Cleanup on SW unregister (unlikely but safe)
      r.addEventListener('updatefound', () => {
        clearInterval(interval);
        window.removeEventListener('focus', checkOnFocus);
      });
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
