'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase';
import AdminSidebar from '../components/AdminSidebar';

interface Orden {
  id: string;
  orderId?: string;
  cliente: {
    nombreApellido: string;
    celular: string;
  };
  total: number;
  estado: string;
  notificacionWhatsAppEnviada?: boolean;
  fechaTexto?: string;
  fechaCreacion?: any;
}

export default function DashboardAdminPage() {
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarOrdenes() {
      try {
        setCargando(true);
        // Consultar la colección 'pedidos' y ordenar por fecha de más reciente a más antigua
        const q = query(collection(db, 'pedidos'), orderBy('fechaCreacion', 'desc'));
        const querySnap = await getDocs(q);
        const lista: Orden[] = [];
        querySnap.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() } as Orden);
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

  // INCLUYE BOLD Y WHATSAPP EN "PEDIDOS NUEVOS"
  const pedidosNuevos = ordenes.filter(
    (o) => 
      o.estado === 'nuevo' || 
      o.estado === 'Pendiente' || 
      o.estado === 'Pendiente WhatsApp'
  ).length;

  const paraRevision = ordenes.filter((o) => o.estado === 'revision').length;
  const avisosWhatsApp = ordenes.filter((o) => !o.notificacionWhatsAppEnviada).length;
  const saldosPorRecaudar = ordenes
    .filter((o) => o.estado !== 'entregado' && o.estado !== 'anulado')
    .reduce((acc, o) => acc + (o.total || 0), 0);

  const fechaHoy = new Date().toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex font-sans text-[#111111]">
      
      <AdminSidebar />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 md:p-12 space-y-10 overflow-y-auto">
        
        <header className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 text-[#8C8275]">
            <span>Sitio al día</span>
            <span>•</span>
            <span>Última comprobación: hoy</span>
          </div>
          <Link
            href="/"
            className="border border-[#EAE7E1] bg-white px-4 py-1.5 rounded-lg text-[#111111] hover:bg-[#FAF9F6] font-medium transition-colors"
          >
            Ver Tienda
          </Link>
        </header>

        <div className="flex justify-between items-end border-b border-[#EAE7E1] pb-4">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#111111]">
            DECOESPEJOS
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
          
          {/* PEDIDOS RECIENTES */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-[#EAE7E1] shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-[#EAE7E1] pb-4">
              <h3 className="font-serif text-xl text-[#111111]">
                Pedidos recientes (Más nuevos primero)
              </h3>
              <Link href="/admin/pedidos" className="text-xs underline font-medium text-[#111111]">
                Ver todos
              </Link>
            </div>

            {ordenes.length === 0 ? (
              <p className="text-xs text-[#8C8275] py-8">
                Nada pendiente por ahora. Buen trabajo.
              </p>
            ) : (
              <div className="divide-y divide-[#EAE7E1]">
                {ordenes.slice(0, 5).map((ord) => {
                  const displayId = ord.orderId || ord.id;
                  return (
                    <div
                      key={ord.id}
                      onClick={() => router.push('/admin/pedidos')}
                      className="py-3 flex justify-between items-center text-xs hover:bg-[#FAF9F6] px-3 rounded-xl transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{ord.cliente?.nombreApellido || 'Cliente'}</span>
                          <span className="text-[10px] text-[#8C8275] bg-[#F2F0EB] px-2 py-0.5 rounded-full">
                            {displayId}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8C8275] mt-0.5">
                          {ord.fechaTexto || 'Fecha no registrada'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-serif font-semibold text-sm">
                          ${ord.total?.toLocaleString('es-CO')} COP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PRÓXIMAS ENTREGAS */}
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