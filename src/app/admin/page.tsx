'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { db } from '../lib/firebase';

interface Orden {
  id: string;
  cliente: {
    nombreApellido: string;
    celular: string;
  };
  total: number;
  estado: string;
  notificacionWhatsAppEnviada: boolean;
  fechaEntregaEstimada?: any;
}

export default function DashboardAdminPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarOrdenes() {
      try {
        setCargando(true);
        const q = query(collection(db, 'ordenes'));
        const querySnap = await getDocs(q);
        const lista: Orden[] = [];
        querySnap.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() } as Orden);
        });
        setOrdenes(lista);
      } catch (error) {
        console.error('Error cargando órdenes:', error);
      } finally {
        setCargando(false);
      }
    }

    cargarOrdenes();
  }, []);

  const pedidosNuevos = ordenes.filter((o) => o.estado === 'nuevo').length;
  const paraRevision = ordenes.filter((o) => o.estado === 'revision').length;
  const avisosWhatsApp = ordenes.filter((o) => !o.notificacionWhatsAppEnviada).length;
  const saldosPorRecaudar = ordenes
    .filter((o) => o.estado !== 'completado')
    .reduce((acc, o) => acc + o.total, 0);

  const fechaHoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex font-sans text-[#111111]">
      
      {/* SIDEBAR NAVEGACIÓN LATERAL */}
      <aside className="w-64 bg-[#26211E] text-[#FAF9F6] p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-[#3D3530] pb-6">
            <span className="text-2xl">🪞</span>
            <div>
              <h1 className="font-serif text-base tracking-widest uppercase font-semibold">
                MAISON MIROIR
              </h1>
              <span className="text-[10px] uppercase text-[#A89F91] tracking-wider block">
                Panel del Taller
              </span>
            </div>
          </div>

          <nav className="space-y-2 text-xs uppercase tracking-widest font-medium">
            <Link
              href="/admin"
              className="flex items-center gap-3 bg-[#423832] text-white px-4 py-3 rounded-xl transition-all"
            >
              <span>🏠</span> Inicio
            </Link>
            <Link
              href="/admin/pedidos"
              className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all"
            >
              <span>🛍️</span> Pedidos
            </Link>
            <Link
              href="/admin/productos"
              className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all"
            >
              <span>🪞</span> Productos
            </Link>
            <Link
              href="/admin/contenido"
              className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all"
            >
              <span>📄</span> Contenido del sitio
            </Link>
            <Link
              href="/admin/resenas"
              className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all"
            >
              <span>⭐</span> Reseñas
            </Link>
            {/* <Link
              href="/admin/solicitudes"
              className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all"
            >
              <span>💬</span> Solicitudes
            </Link> */}
            <Link
              href="/admin/reclamos"
              className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all"
            >
              <span>⚠️</span> Quejas y reclamos
            </Link>
            <Link
              href="/admin/pagos"
              className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all"
            >
              <span>💳</span> Pagos
            </Link>
          </nav>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 md:p-12 space-y-10 overflow-y-auto">
        
        <header className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 text-[#8C8275]">
            <span>Sitio al día</span>
            <span>•</span>
            <span>Última comprobación: hoy</span>
          </div>
          <button className="border border-[#EAE7E1] bg-white px-4 py-1.5 rounded-lg text-[#111111] hover:bg-[#FAF9F6] font-medium transition-colors">
            Salir
          </button>
        </header>

        <div className="flex justify-between items-end border-b border-[#EAE7E1] pb-4">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#111111]">
            Hoy en el taller
          </h2>
          <span className="text-xs text-[#8C8275] uppercase tracking-widest">{fechaHoy}</span>
        </div>

        {/* 4 TARJETAS MÉTRICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#FCD8C5] rounded-3xl p-6 space-y-4 shadow-sm border border-[#F5C4AC]">
            <span className="text-xs uppercase tracking-wider text-[#664638] font-medium block">
              Pedidos nuevos
            </span>
            <span className="text-4xl font-serif font-semibold text-[#664638] block">
              {cargando ? '...' : pedidosNuevos}
            </span>
          </div>

          <div className="bg-[#F9ECE1] rounded-3xl p-6 space-y-4 shadow-sm border border-[#EFE0D3]">
            <span className="text-xs uppercase tracking-wider text-[#705645] font-medium block">
              Para revisión
            </span>
            <span className="text-4xl font-serif font-semibold text-[#705645] block">
              {cargando ? '...' : paraRevision}
            </span>
          </div>

          <div className="bg-[#D3F5E4] rounded-3xl p-6 space-y-4 shadow-sm border border-[#BDEDD2]">
            <span className="text-xs uppercase tracking-wider text-[#2D5A44] font-medium block">
              Avisos de WhatsApp por enviar
            </span>
            <span className="text-4xl font-serif font-semibold text-[#2D5A44] block">
              {cargando ? '...' : avisosWhatsApp}
            </span>
          </div>

          <div className="bg-[#C83E16] text-white rounded-3xl p-6 space-y-4 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-white/80 font-medium block">
              Saldos por recaudar
            </span>
            <span className="text-3xl font-serif font-semibold block">
              ${cargando ? '...' : saldosPorRecaudar.toLocaleString('es-CO')}
            </span>
          </div>
        </div>

        {/* SECCIÓN INFERIOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[#EAE7E1] shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-[#EAE7E1] pb-4">
              <h3 className="font-serif text-xl text-[#111111]">
                Pedidos que piden tu atención
              </h3>
              <Link href="/admin/pedidos" className="text-xs underline font-medium text-[#111111]">
                Ver todos
              </Link>
            </div>

            {pedidosNuevos === 0 ? (
              <p className="text-xs text-[#8C8275] py-8">
                Nada pendiente por ahora. Buen trabajo.
              </p>
            ) : (
              <div className="divide-y divide-[#EAE7E1]">
                {ordenes.slice(0, 5).map((ord) => (
                  <div key={ord.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold">{ord.cliente?.nombreApellido || 'Cliente'}</p>
                      <p className="text-[10px] text-[#8C8275]">{ord.id}</p>
                    </div>
                    <span className="font-semibold">${ord.total?.toLocaleString('es-CO')} COP</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-[#EAE7E1] shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-[#EAE7E1] pb-4">
              <h3 className="font-serif text-xl text-[#111111]">
                Próximas entregas
              </h3>
              <span className="text-xs text-[#8C8275]">7 días</span>
            </div>

            <div className="space-y-4 text-xs text-[#8C8275]">
              <p>Ninguna en los próximos 7 días.</p>
              <div className="pt-2 border-t border-[#EAE7E1]">
                <p><strong className="text-[#111111]">Atrasadas:</strong> ninguna.</p>
                <p className="text-[11px] pt-2 leading-relaxed">
                  Si se vence el plazo aceptado, el cliente puede cancelar y pedir todo lo pagado.
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
}