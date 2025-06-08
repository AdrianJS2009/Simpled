'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { AtSign, Github, KeyRound, Mail } from 'lucide-react';
import React, { useState } from 'react';

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepUserLoggedIn, setKeepUserLoggedIn] = useState(false);
  const { loginUser, externalLogin } = useAuth();
  const [banned, setBanned] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(email, password, keepUserLoggedIn);
    } catch (error: any) {
      if (error && error.banned) {
        setBanned(true);
      }
    }
  };

  if (banned) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Cuenta baneada</CardTitle>
            <CardDescription>
              Tu cuenta ha sido baneada y no puedes acceder a la plataforma.
              <br />
              Si crees que esto es un error, contacta con un administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <span className="text-6xl">🚫</span>
              <a href="mailto:admin@admin.es" className="text-blue-600 underline">
                Contactar administrador
              </a>
              <a href="/login" className="text-muted-foreground text-sm underline">
                Volver a intentar iniciar sesión
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Inicia sesión</CardTitle>
          <CardDescription>Escribe tu correo electrónico para iniciar sesión</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <div className="relative flex items-center">
                  <AtSign className="text-muted-foreground absolute left-3 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@dominio.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative flex items-center">
                  <KeyRound className="text-muted-foreground absolute left-3 h-5 w-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="keepUserLoggedIn"
                  checked={keepUserLoggedIn}
                  onCheckedChange={(checked: boolean) => setKeepUserLoggedIn(!!checked)}
                />
                <Label htmlFor="keepUserLoggedIn">Mantener sesión iniciada</Label>
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Iniciar sesión
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background text-muted-foreground px-2">
                      O continuar con
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => externalLogin('GitHub')}
                    className="w-full"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => externalLogin('Google')}
                    className="w-full"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm">
              ¿No tienes cuenta?{' '}
              <a href="/registro" className="underline underline-offset-4">
                Regístrate ya
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
