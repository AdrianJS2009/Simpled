"use client";

import type React from "react";

import { DarkModeToggle } from "@/components/darkmode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Info, Layers, LogOut, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [mostrarLogin, setMostrarLogin] = useState(true);
  const { isAuthenticated, cerrarSesion } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setMostrarLogin(false);
    }
  }, [isAuthenticated]);

  const NavItems = () => (
    <>
      <NavLink href="/" icon={<Home className="size-4" />}>
        Inicio
      </NavLink>
      <NavLink href="/nosotros" icon={<Info className="size-4" />}>
        Nosotros
      </NavLink>
      <NavLink href="/tableros" icon={<Layers className="size-4" />}>
        Tableros
      </NavLink>
      {mostrarLogin ? (
        <NavLink href="/login">Login</NavLink>
      ) : (
        <>
          <NavLink href="/perfil" icon={<User className="size-4" />}>
            Perfil
          </NavLink>
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
          >
            <LogOut className="size-4" />
            <span>Cerrar sesión</span>
          </button>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Simpled.</h1>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <nav className="flex items-center gap-1 mx-6">
            <NavItems />
          </nav>
          <DarkModeToggle />
          {!mostrarLogin && (
            <Avatar className="ml-2">
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-semibold">Menú</h2>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </div>
            <nav className="flex flex-col gap-4">
              <NavItems />
            </nav>
            <div className="mt-auto flex items-center justify-between pt-4">
              <DarkModeToggle />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

const NavLink = ({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <Link
    href={href}
    className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent"
  >
    {icon}
    <span>{children}</span>
  </Link>
);
