'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePushNotifications } from '../lib/usePushNotifications';
import { getMessaging, getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { app, db } from '../lib/firebase';

interface MenuItem {
  label: string;
  href: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { label: 'Inicio', href: '/admin', icon: '🏠' },
  { label: 'Pedidos', href: '/admin/pedidos', icon: '🛍️' },
  { label: 'Productos', href: '/admin/productos', icon: '🪞' },
  { label: 'Promoción', href: '/admin/promocion', icon: '🏷️' },
  { label: 'Contenido del sitio', href: '/admin/contenido', icon: '📄' },
  { label: 'Reseñas', href: '/admin/resenas', icon: '⭐' },
  { label: 'Quejas y reclamos', href: '/admin/reclamos', icon: '⚠️' },
  { label: 'Pagos', href: '/admin/pagos', icon: '💳' },
];

const VAPID_KEY = 'BG8NFgzzPzO67YskQL-kwucCC9Qk9VfpzNE3JhkgiZnY03O7nUSrkBzhMvDVI7smn6fdWLaCFoflIFBWRYFgCbk';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [notifStatus, setNotifStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Ejecuta la escucha automática
  usePushNotifications();

  // Función manual para solicitar/actualizar el token FCM
  const handleEnableNotifications = async () => {
    try {
      setNotifStatus('loading');
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        alert('Tu navegador no soporta notificaciones push.');
        setNotifStatus('error');
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        // Registrar o reusar el Service Worker existente
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        
        await navigator.serviceWorker.ready;
        const messaging = getMessaging(app);

        const tokenActual = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (tokenActual) {
          await setDoc(doc(db, 'admin_tokens', tokenActual), {
            token: tokenActual,
            actualizadoEn: new Date(),
            userAgent: navigator.userAgent
          });
          setNotifStatus('success');
          alert('¡Notificaciones activadas con éxito en este dispositivo!');
        } else {
          setNotifStatus('error');
          alert('No se pudo obtener el token de notificación.');
        }
      } else {
        setNotifStatus('error');
        alert('Permiso de notificaciones denegado. Habilítalo en los ajustes del navegador.');
      }
    } catch (error) {
      console.error('Error al activar notificaciones:', error);
      setNotifStatus('error');
    }
  };

  return (
    <>
      {/* Botón de Hamburguesa para Móviles */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-[#26211E] text-white md:hidden shadow-lg border border-[#3D3530] focus:outline-none"
        aria-label="Abrir menú"
      >
        <span className="text-xl">{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* Overlay oscuro en móviles */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Sidebar con flex layout que fija la sección inferior */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-40 h-screen w-64 bg-[#26211E] text-[#FAF9F6] p-6 flex flex-col justify-between flex-shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Contenido superior scrolleable si la pantalla es corta */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* LOGO */}
          <div className="flex items-center gap-3 border-b border-[#3D3530] pb-6">
            <span className="text-2xl">🪞</span>
            <div>
              <h1 className="font-serif text-base tracking-widest uppercase font-semibold">
                DECOESPEJOS
              </h1>
              <span className="text-[10px] uppercase text-[#A89F91] tracking-wider block">
                Panel del Taller
              </span>
            </div>
          </div>

          {/* NAVEGACIÓN */}
          <nav className="space-y-1 text-xs uppercase tracking-widest font-medium">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#423832] text-white font-semibold'
                      : 'text-[#A89F91] hover:text-white hover:bg-[#3D3530]/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* SECCIÓN INFERIOR FIJA: Botón de Notificaciones */}
        <div className="pt-4 border-t border-[#3D3530] shrink-0">
          <button
            onClick={handleEnableNotifications}
            disabled={notifStatus === 'loading'}
            className={`w-full py-2.5 px-3 rounded-xl text-white text-[11px] uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-2 border ${
              notifStatus === 'success' 
                ? 'bg-emerald-900/40 border-emerald-600 text-emerald-200' 
                : 'bg-[#423832] hover:bg-[#52453e] border-[#52453e]'
            }`}
          >
            <span>🔔</span>
            <span>
              {notifStatus === 'loading'
                ? 'Activando...'
                : notifStatus === 'success'
                ? 'Alertas Activas'
                : 'Activar Alertas'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}