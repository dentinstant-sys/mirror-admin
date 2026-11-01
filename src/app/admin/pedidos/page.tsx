'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import { db } from '@/app/lib/firebase';
import AdminSidebar from '@/app/components/AdminSidebar';

interface ItemCarrito {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
}

interface Orden {
  id: string;
  orderId?: string;
  cliente: {
    nombreApellido?: string;
    celular?: string;
    correo?: string;
    departamento?: string;
    ciudad?: string;
    direccion?: string;
    indicaciones?: string;
  };
  items: ItemCarrito[];
  total: number;
  estado: string; // 'nuevo' | 'revision' | 'con_saldo' | 'aviso_enviar' | 'confirmado' | 'en_fabricacion' | 'listo' | 'despachado' | 'entregado' | 'anulado' | 'sin_pagar' | 'Pendiente'
  metodoPago?: string;
  fechaTexto?: string;
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
  
  // Estado para el pedido seleccionado (Drawer lateral)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<Orden | null>(null);
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  useEffect(() => {
    async function cargarPedidos() {
      try {
        setCargando(true);
        // Apuntamos a la colección 'pedidos' que creamos en el carrito
        const q = query(collection(db, 'pedidos'));
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

  // Función para cambiar el estado del pedido en Firestore
  const cambiarEstado = async (nuevoEstado: string) => {
    if (!ordenSeleccionada) return;
    try {
      setGuardandoEstado(true);
      const docRef = doc(db, 'pedidos', ordenSeleccionada.id);
      await updateDoc(docRef, { estado: nuevoEstado });

      // Actualizar estado local
      setOrdenes((prev) =>
        prev.map((ord) => (ord.id === ordenSeleccionada.id ? { ...ord, estado: nuevoEstado } : ord))
      );
      setOrdenSeleccionada((prev) => (prev ? { ...prev, estado: nuevoEstado } : null));
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('No se pudo actualizar el estado.');
    } finally {
      setGuardandoEstado(false);
    }
  };

  // Filtrado dinámico por estado y búsqueda
  const ordenesFiltradas = ordenes.filter((ord) => {
    let cumpleFiltro = true;
    if (filtroActivo === 'activos') {
      cumpleFiltro = ord.estado !== 'entregado' && ord.estado !== 'anulado' && ord.estado !== 'sin_pagar';
    } else {
      cumpleFiltro = ord.estado === filtroActivo;
    }

    const idOrdenStr = ord.orderId || ord.id;
    const coincideBusqueda =
      idOrdenStr.toLowerCase().includes(busqueda.toLowerCase()) ||
      (ord.cliente?.nombreApellido && ord.cliente.nombreApellido.toLowerCase().includes(busqueda.toLowerCase())) ||
      (ord.cliente?.celular && ord.cliente.celular.includes(busqueda));

    return cumpleFiltro && coincideBusqueda;
  });

  // Función para abrir WhatsApp al cliente con mensaje preconfigurado
  const hablarPorWhatsApp = (ord: Orden) => {
    const celular = ord.cliente?.celular || '';
    // Limpiar caracteres no numéricos para el enlace de WhatsApp
    const celularLimpio = celular.replace(/\D/g, '');
    
    if (!celularLimpio) {
      alert('Este pedido no tiene un número de celular válido registrado.');
      return;
    }

    const identificador = ord.orderId || ord.id;
    const mensaje = `Hola ${ord.cliente?.nombreApellido || 'Cliente'}, te hablo de la tienda Decoespejos en relación a tu pedido *#${identificador}*. ¿Cómo te podemos ayudar?`;
    
    const urlWp = `https://wa.me/57${celularLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWp, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex font-sans text-[#111111]">
      <AdminSidebar />

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
              placeholder="Buscar MM-... o teléfono/nombre"
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
              {ordenesFiltradas.map((ord) => {
                const displayId = ord.orderId || ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setOrdenSeleccionada(ord)}
                    className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs hover:bg-[#FAF9F6] px-4 rounded-xl transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{displayId}</span>
                        <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-[#F2F0EB] text-[#8C8275]">
                          {ord.estado}
                        </span>
                        {ord.metodoPago && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {ord.metodoPago}
                          </span>
                        )}
                      </div>
                      <p className="text-[#8C8275] mt-0.5">
                        {ord.cliente?.nombreApellido || 'Cliente sin nombre'} — Tel: {ord.cliente?.celular || 'S/N'} {ord.fechaTexto ? `— ${ord.fechaTexto}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif font-semibold text-base">${ord.total?.toLocaleString('es-CO')} COP</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[11px] text-[#8C8275]">
          Haz clic en cualquier pedido para ver el detalle completo, cambiar su estado o hablar con el cliente.
        </p>

      </main>

      {/* DRAWER LATERAL DE DETALLE DE PEDIDO */}
      {ordenSeleccionada && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-lg bg-[#FAF9F6] h-full p-8 overflow-y-auto shadow-2xl relative flex flex-col justify-between">
            
            <div className="space-y-6">
              {/* Cabecera del Drawer */}
              <div className="flex justify-between items-center border-b border-[#EAE7E1] pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#8C8275] block">
                    Detalle del Pedido
                  </span>
                  <h3 className="font-serif text-xl font-semibold text-[#111111]">
                    {ordenSeleccionada.orderId || ordenSeleccionada.id}
                  </h3>
                </div>
                <button
                  onClick={() => setOrdenSeleccionada(null)}
                  className="text-xl font-light text-[#111111] hover:text-[#8C8275] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Botón WhatsApp rápido */}
              <button
                type="button"
                onClick={() => hablarPorWhatsApp(ordenSeleccionada)}
                className="w-full bg-[#25D366] text-white hover:bg-[#20ba5a] transition-colors py-3 rounded-xl text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>📱</span>
                <span>Hablarle al cliente por WhatsApp</span>
              </button>

              {/* Estado y Cambio de Estado */}
              <div className="bg-white p-4 rounded-xl border border-[#EAE7E1] space-y-2">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#8C8275]">
                  Estado Actual del Pedido
                </label>
                <select
                  value={ordenSeleccionada.estado}
                  onChange={(e) => cambiarEstado(e.target.value)}
                  disabled={guardandoEstado}
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#EAE7E1] rounded-lg text-xs font-semibold focus:outline-none focus:border-[#111111]"
                >
                  {FILTROS.filter(f => f.id !== 'activos').map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nombre}
                    </option>
                  ))}
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pendiente WhatsApp">Pendiente WhatsApp</option>
                </select>
                {ordenSeleccionada.fechaTexto && (
                  <p className="text-[10px] text-[#8C8275] pt-1">
                    Realizado el: {ordenSeleccionada.fechaTexto}
                  </p>
                )}
              </div>

              {/* Información del Cliente */}
              <div className="bg-white p-4 rounded-xl border border-[#EAE7E1] space-y-2 text-xs">
                <h4 className="font-semibold uppercase tracking-wider text-[#111111] border-b border-[#EAE7E1] pb-1">
                  Información del Cliente
                </h4>
                <p><strong>Nombre:</strong> {ordenSeleccionada.cliente?.nombreApellido || 'No especificado'}</p>
                <p><strong>Celular:</strong> {ordenSeleccionada.cliente?.celular || 'No especificado'}</p>
                <p><strong>Correo:</strong> {ordenSeleccionada.cliente?.correo || 'No especificado'}</p>
                <p><strong>Ciudad / Depto:</strong> {ordenSeleccionada.cliente?.ciudad}, {ordenSeleccionada.cliente?.departamento}</p>
                <p><strong>Dirección:</strong> {ordenSeleccionada.cliente?.direccion}</p>
                {ordenSeleccionada.cliente?.indicaciones && (
                  <p><strong>Indicaciones:</strong> {ordenSeleccionada.cliente.indicaciones}</p>
                )}
              </div>

              {/* Listado de Productos */}
              <div className="bg-white p-4 rounded-xl border border-[#EAE7E1] space-y-4 text-xs">
                <h4 className="font-semibold uppercase tracking-wider text-[#111111] border-b border-[#EAE7E1] pb-1">
                  Productos Comprados ({ordenSeleccionada.items?.length || 0})
                </h4>

                <div className="divide-y divide-[#EAE7E1] max-h-60 overflow-y-auto">
                  {ordenSeleccionada.items?.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.imagen && (
                          <div className="relative w-12 h-14 bg-[#FAF9F6] rounded-lg overflow-hidden border border-[#EAE7E1] flex-shrink-0">
                            <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-serif font-medium text-sm">{item.nombre}</p>
                          <p className="text-[11px] text-[#8C8275]">Cantidad: {item.cantidad}</p>
                        </div>
                      </div>
                      <p className="font-serif font-semibold text-sm">
                        ${(item.precio * item.cantidad).toLocaleString('es-CO')} COP
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#EAE7E1] flex justify-between items-center text-sm font-bold">
                  <span>Total Orden:</span>
                  <span className="font-serif text-base">${ordenSeleccionada.total?.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

            </div>

            {/* Pie del Drawer */}
            <div className="pt-6 border-t border-[#EAE7E1]">
              <button
                onClick={() => setOrdenSeleccionada(null)}
                className="w-full bg-[#111111] text-[#FAF9F6] py-3 rounded-xl text-xs uppercase tracking-widest font-semibold cursor-pointer"
              >
                Cerrar Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}