'use client';

import { Figtree } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import './globals.css';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { AuthProvider } from '@/contexts/AuthContext';
import { BoardsProvider } from '@/contexts/BoardsContext';
import { InvitationsProvider } from '@/contexts/InvitationsContext';
import { SignalRProvider } from '@/contexts/SignalRContext';
import { TeamsProvider } from '@/contexts/TeamsContext';

import { Bounce, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  const router = useRouter();
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // console.log('Evento keydown:', { key: e.key, code: e.code, altKey: e.altKey });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const key = e.key.toLowerCase();
      switch (key) {
        case '1':
          e.preventDefault();
          router.push('/');
          break;
        case '2':
          e.preventDefault();
          router.push('/about');
          break;
        case '/':
        case '?':
        case '7':
          e.preventDefault();
          setShowCheatsheet(true);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${figtree.variable} flex min-h-screen flex-col antialiased`}>
        <AuthProvider>
          <InvitationsProvider>
            <BoardsProvider>
              <TeamsProvider>
                <SignalRProvider>
                  <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    transition={Bounce}
                    className="toast-container"
                  />

                  <Navbar />
                  <main className="container mx-auto flex-1 p-4">{children}</main>
                  <Footer />

                  <Dialog open={showCheatsheet} onOpenChange={setShowCheatsheet}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Atajos de teclado</DialogTitle>
                        <DialogDescription>
                          Lista de combinaciones con <kbd>Alt</kbd>:
                        </DialogDescription>
                      </DialogHeader>
                      <ul className="mt-4 list-inside list-disc space-y-2 text-sm">
                        <li>
                          <kbd>Alt + !</kbd>: Ir al inicio
                        </li>
                        <li>
                          <kbd>Alt + "</kbd>: Sobre nosotros
                        </li>
                        <li>
                          <kbd>Alt + /</kbd>: Mostrar este menú
                        </li>
                      </ul>
                      <button className="mt-4" onClick={() => setShowCheatsheet(false)}>
                        Cerrar
                      </button>
                    </DialogContent>
                  </Dialog>
                </SignalRProvider>
              </TeamsProvider>
            </BoardsProvider>
          </InvitationsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
