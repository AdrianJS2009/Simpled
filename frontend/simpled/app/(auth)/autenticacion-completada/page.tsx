'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';

export default function ExternalAuth() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (token && id) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', id);

      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        router.push('/');
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [token, id, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Autenticado correctamente</CardTitle>
            <CardDescription className="text-center">
              Te has logeado correctamente vía externa (Google/GitHub)
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-2 flex flex-col items-center justify-center gap-4">
            <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">Redirigiendo en {countdown}...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
