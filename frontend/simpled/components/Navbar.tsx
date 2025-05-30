'use client';

import { DarkModeToggle } from '@/components/DarkModeToggle';
import IconLink from '@/components/IconLink';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Home, Info, Layers, LogIn, LogOut, Menu, PieChart, User, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import InvitationsModal from './InvitationModal';

interface NavItemsProps {
  readonly mostrarLogin: boolean;
  readonly authId: string;
  readonly logout: () => void;
  readonly onShowInvitations: () => void;
  readonly className?: string;
}

function NavItems({
  mostrarLogin,
  authId,
  logout,
  onShowInvitations,
  className = '',
}: NavItemsProps) {
  return (
    <nav className={`flex ${className} gap-4`}>
      <IconLink href="/" icon={<Home className="size-4" />}>
        Inicio
      </IconLink>
      <IconLink href="/nosotros" icon={<Info className="size-4" />}>
        Nosotros
      </IconLink>
      {mostrarLogin ? (
        <IconLink href="/login" icon={<LogIn className="size-4" />}>
          Login
        </IconLink>
      ) : (
        <>
          <IconLink href="/dashboard" icon={<PieChart className="size-4" />}>
            Dashboard
          </IconLink>
          <IconLink href="/tableros" icon={<Layers className="size-4" />}>
            Tableros
          </IconLink>
          <IconLink href="/equipos" icon={<Users className="size-4" />}>
            Equipos
          </IconLink>
          <IconLink href={`/perfil/${authId}`} icon={<User className="size-4" />}>
            Perfil
          </IconLink>
          <button
            onClick={onShowInvitations}
            className="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
            aria-label="Ver invitaciones pendientes"
          >
            <Bell className="size-4" />
            <span>Invitaciones</span>
          </button>
          <button
            onClick={logout}
            className="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
          >
            <LogOut className="size-4" />
            <span>Cerrar sesión</span>
          </button>
        </>
      )}
    </nav>
  );
}

export default function Navbar() {
  const [mostrarLogin, setMostrarLogin] = useState(true);
  const { isAuthenticated, logout, auth } = useAuth();
  const [showInvitations, setShowInvitations] = useState(false);

  useEffect(() => {
    setMostrarLogin(!isAuthenticated);
  }, [isAuthenticated]);

  return (
    <div className="bg-background/80 sticky top-0 z-10 flex items-center justify-between border-b p-4 backdrop-blur-sm">
      <h1 className="text-4xl font-bold transition-all duration-300 hover:scale-105 hover:rotate-1">
        <Link href="/">Simpled.</Link>
      </h1>

      <div className="hidden items-center gap-4 font-semibold md:flex">
        <NavItems
          mostrarLogin={mostrarLogin}
          authId={auth.id ?? ''}
          logout={logout}
          onShowInvitations={() => setShowInvitations(true)}
          className="items-center"
        />
        <DarkModeToggle />
      </div>

      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="flex flex-col">
          <div className="mt-6"></div>
          <NavItems
            mostrarLogin={mostrarLogin}
            authId={auth.id ?? ''}
            logout={logout}
            onShowInvitations={() => setShowInvitations(true)}
            className="m-4 flex-col"
          />
          <div className="mt-auto flex items-center justify-between pt-4">
            <DarkModeToggle />
          </div>
        </SheetContent>
      </Sheet>

      {showInvitations && <InvitationsModal onClose={() => setShowInvitations(false)} />}
    </div>
  );
}
