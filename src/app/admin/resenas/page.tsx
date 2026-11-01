'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import AdminSidebar from '@/app/components/AdminSidebar';

interface Reseña {
  id: string;
  nombre: string;
  fecha: string;
  estrellas: number;
  comentario: string;
}

export default function AdminReseñasPage() {
  const [reseñas, setReseñas] = useState<Reseña[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);

  const [nuevaReseña, setNuevaReseña] = useState({
    nombre: '',
    fecha: '',
    estrellas: 5,
    comentario: '',
  });

  useEffect(() => {
    async function cargarReseñas() {
      try {
        setCargando(true);
        const querySnap = await getDocs(collection(db, 'reseñas'));
        const lista: Reseña[] = [];
        querySnap.forEach((d) => {
          lista.push({ id: d.id, ...d.data() } as Reseña);
        });
        setReseñas(lista);
      } catch (error) {
        console.error('Error cargando reseñas:', error);
      } finally {
        setCargando(false);
      }
    }

    cargarReseñas();
  }, []);

  const handleAgregarReseña = (e: React.FormEvent) => {
    e.preventDefault();
    const item: Reseña = {
      id: `RES-${Date.now()}`,
      ...nuevaReseña,
    };
    setReseñas((prev) => [...prev, item]);
    setModalNuevo(false);
    setNuevaReseña({ nombre: '', fecha: '', estrellas: 5, comentario: '' });
  };

  const handleGuardarCambios = async () => {
    try {
      setGuardando(true);
      // Guardar batch de reseñas en Firestore
      for (const r of reseñas) {
        await setDoc(doc(db, 'reseñas', r.id), r);
      }
      alert('Reseñas guardadas correctamente.');
    } catch (error) {
      console.error('Error al guardar reseñas:', error);
      alert('Ocurrió un error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex font-sans text-[#111111]">
      
     <AdminSidebar />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 md:p-12 space-y-6 overflow-y-auto">
        
        {/* BARRA DE TÍTULO Y BOTÓN GUARDAR */}
        <div className="flex justify-between items-start border-b border-[#EAE7E1] pb-4">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#111111]">
              Reseñas
            </h2>
            <span className="text-xs text-[#8C8275]">Se ve en: /</span>
          </div>
          <button
            onClick={handleGuardarCambios}
            disabled={guardando}
            className="bg-[#C83E16] text-white px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest font-semibold hover:bg-[#a63110] transition-colors cursor-pointer"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

        {/* CONTENEDOR DE RESEÑAS */}
        <div className="bg-white rounded-3xl p-8 border border-[#EAE7E1] shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-[#EAE7E1] pb-4">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[#111111]">
              Reseñas ({reseñas.length} de 30)
            </h3>
            <button
              onClick={() => setModalNuevo(true)}
              className="border border-[#C83E16] text-[#C83E16] px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-[#C83E16] hover:text-white transition-colors cursor-pointer"
            >
              Agregar
            </button>
          </div>

          <p className="text-xs text-[#8C8275] leading-relaxed">
            Cópiaslas de tu perfil de Google, con el nombre, la fecha y las estrellas que dice allá. El sitio las muestra en este orden. Sin ninguna visible, la sección no aparece.
          </p>

          {cargando ? (
            <p className="text-xs text-[#8C8275] py-4 animate-pulse">Cargando reseñas...</p>
          ) : reseñas.length === 0 ? (
            <p className="text-xs text-[#8C8275] py-4">
              Todavía no hay ninguno. Lo que esté vacío no se muestra en el sitio.
            </p>
          ) : (
            <div className="space-y-4 pt-2">
              {reseñas.map((res, index) => (
                <div key={res.id} className="p-4 bg-[#FAF9F6] rounded-2xl border border-[#EAE7E1] space-y-2 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>{index + 1}. {res.nombre} ({res.estrellas} ★)</span>
                    <span className="text-[#8C8275]">{res.fecha}</span>
                  </div>
                  <p className="text-[#2D2D2D] font-light">{res.comentario}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[11px] text-[#8C8275]">
          El panel no tiene vista previa: la vista exacta es el sitio, unos minutos después de publicar.
        </p>

      </main>

      {/* MODAL AGREGAR RESEÑA */}
      {modalNuevo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#FAF9F6] p-6 rounded-2xl max-w-md w-full border border-[#EAE7E1] space-y-4 text-xs">
            <h3 className="font-serif text-lg text-[#111111]">Nueva Reseña</h3>
            <form onSubmit={handleAgregarReseña} className="space-y-3">
              <div>
                <label className="block mb-1 font-medium">Nombre del Cliente</label>
                <input
                  type="text"
                  required
                  value={nuevaReseña.nombre}
                  onChange={(e) => setNuevaReseña({ ...nuevaReseña, nombre: e.target.value })}
                  placeholder="Ej. María Fernanda"
                  className="w-full p-2.5 bg-white border border-[#EAE7E1] rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Fecha de la reseña</label>
                <input
                  type="text"
                  required
                  value={nuevaReseña.fecha}
                  onChange={(e) => setNuevaReseña({ ...nuevaReseña, fecha: e.target.value })}
                  placeholder="Ej. Hace 2 semanas"
                  className="w-full p-2.5 bg-white border border-[#EAE7E1] rounded-lg"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Estrellas (1 al 5)</label>
                <select
                  value={nuevaReseña.estrellas}
                  onChange={(e) => setNuevaReseña({ ...nuevaReseña, estrellas: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-[#EAE7E1] rounded-lg"
                >
                  <option value={5}>5 Estrellas</option>
                  <option value={4}>4 Estrellas</option>
                  <option value={3}>3 Estrellas</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Comentario</label>
                <textarea
                  required
                  rows={3}
                  value={nuevaReseña.comentario}
                  onChange={(e) => setNuevaReseña({ ...nuevaReseña, comentario: e.target.value })}
                  placeholder="Excelente calidad y acabado del espejo..."
                  className="w-full p-2.5 bg-white border border-[#EAE7E1] rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNuevo(false)}
                  className="w-1/2 py-2 bg-white border border-[#EAE7E1] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-[#26211E] text-white rounded-lg font-semibold"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}