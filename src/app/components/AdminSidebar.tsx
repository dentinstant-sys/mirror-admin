'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#26211E] text-[#FAF9F6] p-6 flex flex-col justify-between flex-shrink-0">
      <div className="space-y-8">
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
            // Verifica si la ruta actual coincide exactamente con la del ítem
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#423832] text-white font-semibold'
                    : 'text-[#A89F91] hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}