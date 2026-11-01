// app/admin/AdminSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePushNotifications } from '../lib/usePushNotifications';
import { getMessaging, getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db, app } from '../lib/firebase';

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

  // Hook automático opcional
  usePushNotifications();

  // Función manual para forzar la petición de permisos al hacer clic en un botón
  const handleEnableNotifications = async () => {
    try {
      setNotifStatus('loading');
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        alert('Tu navegador no soporta notificaciones push.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
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
      {/* Botón de Hamburguesa para Móviles y Tablets */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-[#26211E] text-white md:hidden shadow-lg border border-[#3D3530] focus:outline-none"
        aria-label="Abrir menú"
      >
        <span className="text-xl">{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* Overlay oscuro en móviles al abrir el menú */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Barra lateral / Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#26211E] text-[#FAF9F6] p-6 flex flex-col justify-between flex-shrink-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-8 overflow-y-auto">
          {/* LOGO / CABECERA DEL SIDEBAR */}
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
          <nav className="space-y-2 text-xs uppercase tracking-widest font-medium">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)} // Cierra el menú al navegar en móvil
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

        {/* Sección inferior: Botón para activar notificaciones de forma manual */}
        <div className="pt-6 border-t border-[#3D3530] mt-auto">
          <button
            onClick={handleEnableNotifications}
            disabled={notifStatus === 'loading' || notifStatus === 'success'}
            className="w-full py-2.5 px-3 rounded-xl bg-[#423832] hover:bg-[#52453e] text-white text-[11px] uppercase tracking-wider font-medium transition-colors flex items-center justify-center gap-2 border border-[#52453e]"
          >
            <span>🔔</span>
            <span>
              {notifStatus === 'success' ? 'Notificaciones Activas' : 'Activar Alertas de Pedidos'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}