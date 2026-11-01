'use client';

import Link from 'next/link';
import { useAuth } from './context/AuthContext'; // Ajusta la ruta de tu AuthContext si es distinta

export default function AdminDashboard() {
  const { user, logout, cargando } = useAuth();

  if (cargando) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="text-xs uppercase tracking-widest text-[#8C8275] animate-pulse">
          Verificando sesión...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] py-16 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* BARRA SUPERIOR */}
        <div className="flex justify-between items-center mb-12 pb-6 border-b border-[#EAE7E1]">
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#8C8275] block font-sans">
              PANEL DE CONTROL
            </span>
            <span className="text-xs font-medium text-[#111111]">{user?.email}</span>
          </div>

          <button
            onClick={logout}
            className="text-xs uppercase tracking-wider text-red-600 hover:text-red-800 font-medium cursor-pointer transition-colors"
          >
            Cerrar Sesión ↗
          </button>
        </div>

        <header className="mb-12 text-center">
          <span className="text-xs tracking-[0.4em] uppercase text-[#8C8275] block mb-2 font-sans">
            DECOESPEJOS
          </span>
          <h1 className="font-serif text-4xl text-[#111111]">Administración de Colección</h1>
        </header>

        {/* MÓDULO ÚNICO DE CATÁLOGO */}
        <div className="grid grid-cols-1 gap-8 max-w-xl mx-auto">
          <div className="bg-white p-8 rounded-2xl border border-[#EAE7E1] shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-3xl mb-4 block">🪞</span>
              <h2 className="font-serif text-2xl text-[#111111] mb-2">Gestión de Espejos</h2>
              <p className="text-xs text-gray-500 font-light mb-6">
                Consulta, edita o elimina las piezas del catálogo. Modifica precios, dimensiones, acabados de marcos y galerías fotográficas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/productos"
                className="flex-1 bg-[#111111] text-[#FAF9F6] text-center py-3.5 rounded-xl text-xs uppercase tracking-widest hover:bg-[#8C8275] transition-colors block font-medium"
              >
                Ver Catálogo
              </Link>
              <Link
                href="/productos/nuevo"
                className="border border-[#111111] text-[#111111] text-center py-3.5 px-6 rounded-xl text-xs uppercase tracking-widest hover:bg-[#F2F0EB] transition-colors block font-medium"
              >
                + Nuevo Espejo
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}