'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import AdminSidebar from '@/app/components/AdminSidebar';

interface Reclamo {
  id: string;
  cliente: string;
  tipo: string;
  estado: string;
  fecha: string;
  mensaje: string;
}

const FILTROS_ESTADO = [
  { id: 'abiertas', nombre: 'Abiertas' },
  { id: 'por_vencer', nombre: 'Por vencer' },
  { id: 'recibidas', nombre: 'Recibidas' },
  { id: 'en_tramite', nombre: 'En trámite' },
  { id: 'respondidas', nombre: 'Respondidas' },
  { id: 'todas', nombre: 'Todas' },
];

export default function AdminReclamosPage() {
  const [reclamos, setReclamos] = useState<Reclamo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('abiertas');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    async function cargarReclamos() {
      try {
        setCargando(true);
        const querySnap = await getDocs(collection(db, 'reclamos'));
        const lista: Reclamo[] = [];
        querySnap.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() } as Reclamo);
        });
        setReclamos(lista);
      } catch (error) {
        console.error('Error cargando quejas y reclamos:', error);
      } finally {
        setCargando(false);
      }
    }

    cargarReclamos();
  }, []);

  const reclamosFiltrados = reclamos.filter((r) => {
    const coincideEstado = filtroEstado === 'todas' ? true : r.estado === filtroEstado;
    const coincideTipo = filtroTipo === 'todos' ? true : r.tipo === filtroTipo;
    return coincideEstado && coincideTipo;
  });

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex font-sans text-[#111111]">
      
      {/* SIDEBAR NAVEGACIÓN LATERAL */}
 <AdminSidebar />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 md:p-12 space-y-6 overflow-y-auto">
        
        <div className="flex justify-between items-start border-b border-[#EAE7E1] pb-4">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#111111]">
            Quejas y reclamos
          </h2>
          <span className="text-xs text-[#8C8275]">Primero lo que vence antes</span>
        </div>

        {/* CHIPS DE ESTADO */}
        <div className="flex flex-wrap gap-2">
          {FILTROS_ESTADO.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltroEstado(f.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filtroEstado === f.id
                  ? 'bg-[#26211E] text-white'
                  : 'bg-white text-[#111111] border border-[#EAE7E1] hover:bg-[#FAF9F6]'
              }`}
            >
              {f.nombre}
            </button>
          ))}
        </div>

        {/* DESPLEGABLE DE TIPO */}
        <div className="w-full sm:w-72">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full bg-white px-4 py-2.5 rounded-full border border-[#EAE7E1] text-xs focus:outline-none focus:border-[#111111] shadow-sm cursor-pointer"
          >
            <option value="todos">Todos los tipos</option>
            <option value="garantia">Garantía o daño</option>
            <option value="retraso">Retraso en entrega</option>
            <option value="retracto">Retracto / Devolución</option>
          </select>
        </div>

        {/* CONTENEDOR DE RESULTADOS */}
        <div className="bg-white rounded-3xl p-8 border border-[#EAE7E1] shadow-sm min-h-[160px]">
          {cargando ? (
            <p className="text-xs uppercase tracking-widest text-[#8C8275] text-center py-8 animate-pulse">
              Cargando reclamos...
            </p>
          ) : reclamosFiltrados.length === 0 ? (
            <p className="text-xs text-[#8C8275] py-4">
              No hay quejas en este grupo.
            </p>
          ) : (
            <div className="divide-y divide-[#EAE7E1]">
              {reclamosFiltrados.map((rec) => (
                <div key={rec.id} className="py-4 space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>{rec.cliente} — {rec.tipo}</span>
                    <span className="text-[#8C8275]">{rec.fecha}</span>
                  </div>
                  <p className="text-[#2D2D2D] font-light">{rec.mensaje}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

    </div>
  );
}