import { AuthProvider } from './context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'Admin - Decoespejos',
  description: 'Panel de administración del catálogo y proyectos',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🪞</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[#FDFBF7] antialiased text-gray-800">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}