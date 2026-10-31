'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';

interface Orden {
  id: string;
  cliente: {
    nombreApellido?: string;
    celular?: string;
  };
  total: number;
  estado: string; // 'nuevo' | 'revision' | 'con_saldo' | 'aviso_enviar' | 'confirmado' | 'en_fabricacion' | 'listo' | 'despachado' | 'entregado' | 'anulado' | 'sin_pagar'
  fechaCreacion?: any;
}

const FILTROS = [
  { id: 'activos', nombre: 'Activos' },
  { id: 'revision', nombre: 'Para revisión' },
  { id: 'con_saldo', nombre: 'Con saldo' },
  { id: 'aviso_enviar', nombre: 'Con aviso por enviar' },
  { id: 'confirmado', nombre: 'Confirmado' },
  { id: 'en_fabricacion', nombre: 'En fabricación' },
  { id: 'listo', nombre: 'Listo' },
  { id: 'despachado', nombre: 'Despachado' },
  { id: 'entregado', nombre: 'Entregado' },
  { id: 'anulado', nombre: 'Anulado' },
  { id: 'sin_pagar', nombre: 'Sin pagar' },
];

export default function AdminPedidosPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState('activos');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    async function cargarPedidos() {
      try {
        setCargando(true);
        const q = query(collection(db, 'ordenes'));
        const querySnap = await getDocs(q);
        const lista: Orden[] = [];
        querySnap.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() } as Orden);
        });
        setOrdenes(lista);
      } catch (error) {
        console.error('Error al cargar los pedidos:', error);
      } finally {
        setCargando(false);
      }
    }

    cargarPedidos();
  }, []);

  // Filtrado dinámico por estado y búsqueda
  const ordenesFiltradas = ordenes.filter((ord) => {
    // Filtro por estado
    let cumpleFiltro = true;
    if (filtroActivo === 'activos') {
      cumpleFiltro = ord.estado !== 'entregado' && ord.estado !== 'anulado' && ord.estado !== 'sin_pagar';
    } else {
      cumpleFiltro = ord.estado === filtroActivo;
    }

    // Filtro por texto de búsqueda (ID o teléfono/nombre del cliente)
    const coincideBusqueda =
      ord.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      (ord.cliente?.nombreApellido && ord.cliente.nombreApellido.toLowerCase().includes(busqueda.toLowerCase())) ||
      (ord.cliente?.celular && ord.cliente.celular.includes(busqueda));

    return cumpleFiltro && coincideBusqueda;
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
            <Link href="/admin" className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all">
              <span>🏠</span> Inicio
            </Link>
            <Link href="/admin/pedidos" className="flex items-center gap-3 bg-[#423832] text-white px-4 py-3 rounded-xl transition-all">
              <span>🛍️</span> Pedidos
            </Link>
            <Link href="/admin/productos" className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all">
              <span>🪞</span> Productos
            </Link>
            <Link href="/admin/contenido" className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all">
              <span>📄</span> Contenido del sitio
            </Link>
            <Link href="/admin/resenas" className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all">
              <span>⭐</span> Reseñas
            </Link>
            {/* <Link href="/admin/solicitudes" className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all">
              <span>💬</span> Solicitudes
            </Link> */}
            <Link href="/admin/reclamos" className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all">
              <span>⚠️</span> Quejas y reclamos
            </Link>
            <Link href="/admin/pagos" className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all">
              <span>💳</span> Pagos
            </Link>
          </nav>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 md:p-12 space-y-8 overflow-y-auto">
        
        {/* ENCABEZADO Y BUSCADOR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#111111]">
            Pedidos
          </h2>
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar MM-2K7F9Q o 300 000 0000"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white px-4 py-2.5 rounded-full border border-[#EAE7E1] text-xs focus:outline-none focus:border-[#111111] shadow-sm"
            />
          </div>
        </div>

        {/* CHIPS DE FILTRO */}
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltroActivo(f.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filtroActivo === f.id
                  ? 'bg-[#26211E] text-white'
                  : 'bg-white text-[#111111] border border-[#EAE7E1] hover:bg-[#FAF9F6]'
              }`}
            >
              {f.nombre}
            </button>
          ))}
        </div>

        {/* TABLA O CONTENEDOR DE RESULTADOS */}
        <div className="bg-white rounded-3xl p-8 border border-[#EAE7E1] shadow-sm min-h-[200px]">
          {cargando ? (
            <p className="text-xs uppercase tracking-widest text-[#8C8275] text-center py-12 animate-pulse">
              Cargando lista de pedidos...
            </p>
          ) : ordenesFiltradas.length === 0 ? (
            <p className="text-xs text-[#8C8275] py-8">
              No hay pedidos en este grupo.
            </p>
          ) : (
            <div className="divide-y divide-[#EAE7E1]">
              {ordenesFiltradas.map((ord) => (
                <div key={ord.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{ord.id}</span>
                      <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-[#F2F0EB] text-[#8C8275]">
                        {ord.estado}
                      </span>
                    </div>
                    <p className="text-[#8C8275] mt-0.5">
                      {ord.cliente?.nombreApellido || 'Cliente sin nombre'} — Tel: {ord.cliente?.celular || 'S/N'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif font-semibold text-base">${ord.total?.toLocaleString('es-CO')} COP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[11px] text-[#8C8275]">
          Se muestran de a 25. Los pedidos sin pagar y vencidos solo salen con el filtro &quot;Sin pagar&quot;.
        </p>

      </main>

    </div>
  );
}