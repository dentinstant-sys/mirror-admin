'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import AdminSidebar from '@/app/components/AdminSidebar';

interface RedesForm {
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
}

export default function AdminContenidoPage() {
  const [form, setForm] = useState<RedesForm>({
    whatsapp: '',
    instagram: '',
    facebook: '',
    tiktok: '',
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    async function cargarConfiguracion() {
      try {
        const docRef = doc(db, 'configuracion', 'redes');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setForm(docSnap.data() as RedesForm);
        }
      } catch (error) {
        console.error('Error al cargar redes:', error);
      } finally {
        setCargando(false);
      }
    }
    cargarConfiguracion();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    try {
      const docRef = doc(db, 'configuracion', 'redes');
      await setDoc(docRef, form, { merge: true });
      setMensaje({ tipo: 'exito', texto: '¡Enlaces y WhatsApp actualizados correctamente!' });
    } catch (error) {
      console.error('Error al guardar:', error);
      setMensaje({ tipo: 'error', texto: 'Hubo un error al guardar los cambios.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex font-sans text-[#111111]">
      <AdminSidebar />

      <main className="flex-1 p-8 md:p-12 space-y-6 overflow-y-auto">
        <div className="border-b border-[#EAE7E1] pb-4">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#111111]">
            Contenido del Sitio (Redes y WhatsApp)
          </h2>
          <p className="text-xs text-[#666666] mt-1">
            Configura los enlaces de redes sociales y el número flotante de WhatsApp de la tienda.
          </p>
        </div>

        {cargando ? (
          <p className="text-xs uppercase tracking-widest text-[#8C8275] animate-pulse">
            Cargando configuración...
          </p>
        ) : (
          <form onSubmit={handleGuardar} className="bg-white rounded-3xl p-8 border border-[#EAE7E1] shadow-sm max-w-2xl space-y-6">
            
            {/* WHATSAPP */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#555555] mb-2">
                Número de WhatsApp (con código de país, sin espacios ni símbolos)
              </label>
              <input
                type="text"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="Ej: 573001234567"
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#EAE7E1] rounded-xl text-sm focus:outline-none focus:border-[#111111]"
              />
              <span className="text-[11px] text-[#8C8275] mt-1 block">
                Este número activará el botón flotante en la esquina inferior derecha de todo el sitio.
              </span>
            </div>

            {/* INSTAGRAM */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#555555] mb-2">
                Enlace de Instagram
              </label>
              <input
                type="url"
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/tu_cuenta"
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#EAE7E1] rounded-xl text-sm focus:outline-none focus:border-[#111111]"
              />
            </div>

            {/* FACEBOOK */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#555555] mb-2">
                Enlace de Facebook
              </label>
              <input
                type="url"
                name="facebook"
                value={form.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/tu_pagina"
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#EAE7E1] rounded-xl text-sm focus:outline-none focus:border-[#111111]"
              />
            </div>

            {/* TIKTOK */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#555555] mb-2">
                Enlace de TikTok
              </label>
              <input
                type="url"
                name="tiktok"
                value={form.tiktok}
                onChange={handleChange}
                placeholder="https://tiktok.com/@tu_cuenta"
                className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#EAE7E1] rounded-xl text-sm focus:outline-none focus:border-[#111111]"
              />
            </div>

            {mensaje && (
              <div
                className={`p-4 rounded-xl text-xs ${
                  mensaje.tipo === 'exito'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}
              >
                {mensaje.texto}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={guardando}
                className="bg-[#C83E16] text-white px-8 py-3 rounded-full text-xs font-semibold hover:bg-[#a53210] transition-colors cursor-pointer disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}