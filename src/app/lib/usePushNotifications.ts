// app/lib/usePushNotifications.ts
'use client';

import { useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db, app } from '@/app/lib/firebase';

const VAPID_KEY = 'BG8NFgzzPzO67YskQL-kwucCC9Qk9VfpzNE3JhkgiZnY03O7nUSrkBzhMvDVI7smn6fdWLaCFoflIFBWRYFgCbk';

export function usePushNotifications() {
  useEffect(() => {
    async function solicitarPermisos() {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Registrar Service Worker
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          const messaging = getMessaging(app);

          // Obtener token FCM
          const tokenActual = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
          });

          if (tokenActual) {
            // Guardar el token en Firestore bajo la colección 'admin_tokens'
            await setDoc(doc(db, 'admin_tokens', tokenActual), {
              token: tokenActual,
              actualizadoEn: new Date(),
              userAgent: navigator.userAgent
            });
            console.log('Token de notificación guardado:', tokenActual);
          }
        }
      } catch (error) {
        console.error('Error al configurar notificaciones Push:', error);
      }
    }

    solicitarPermisos();

    // Listener para notificaciones en primer plano (cuando la pestaña está abierta)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const messaging = getMessaging(app);
      onMessage(messaging, (payload) => {
        if (payload.notification) {
          new Notification(payload.notification.title || 'Nuevo Pedido', {
            body: payload.notification.body,
            icon: '/icon.png'
          });
        }
      });
    }
  }, []);
}
