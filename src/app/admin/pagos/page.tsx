'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminPagosPage() {
  const [copiado, setCopiado] = useState(false);
  const webhookUrl = 'https://us-central1-maison-mirror-1ab5b.cloudfunctions.net/avisoBold';

  const handleCopiarWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

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
            <Link href="/admin/pedidos" className="flex items-center gap-3 text-[#A89F91] hover:text-white px-4 py-3 rounded-xl transition-all">
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
            <Link href="/admin/pagos" className="flex items-center gap-3 bg-[#423832] text-white px-4 py-3 rounded-xl transition-all">
              <span>💳</span> Pagos
            </Link>
          </nav>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8 md:p-12 space-y-6 overflow-y-auto">
        
        <div className="border-b border-[#EAE7E1] pb-4">
          <h2 className="font-serif text-3xl md:text-4xl font-normal text-[#111111]">
            Pagos
          </h2>
        </div>

        {/* TARJETA 1: CONEXIÓN BOLD */}
        <div className="bg-white rounded-3xl p-8 border border-[#EAE7E1] shadow-sm space-y-6 max-w-2xl">
          <h3 className="font-serif text-xl text-[#111111]">
            Conecta tu cuenta de Bold
          </h3>

          <div className="bg-[#FDE8DF] border border-[#FAD2C2] p-4 rounded-xl text-xs text-[#664638]">
            Tu tienda cobra con Bold. Llave secreta terminada en <code className="font-mono bg-white/60 px-1 py-0.5 rounded">---EyzQ</code>, guardada el 8 oct.
          </div>

          <div>
            <button className="border border-[#C83E16] text-[#C83E16] px-5 py-2 rounded-full text-xs font-semibold hover:bg-[#C83E16] hover:text-white transition-colors cursor-pointer">
              Cambiar las llaves
            </button>
          </div>
        </div>

        {/* TARJETA 2: CONFIGURACIÓN WEBHOOK */}
        <div className="bg-white rounded-3xl p-8 border border-[#EAE7E1] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-2xl">
          <p className="text-xs text-[#2D2D2D] leading-relaxed">
            Para que Bold nos avise cada pago, en <strong>Bold → Integraciones → Webhooks</strong> pega esta dirección:{' '}
            <code className="bg-[#F2F0EB] px-2 py-1 rounded text-[11px] font-mono break-all font-semibold">
              {webhookUrl}
            </code>
          </p>
          <button
            onClick={handleCopiarWebhook}
            className="border border-[#C83E16] text-[#C83E16] px-6 py-2 rounded-full text-xs font-semibold hover:bg-[#C83E16] hover:text-white transition-colors cursor-pointer flex-shrink-0"
          >
            {copiado ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>

      </main>

    </div>
  );
}