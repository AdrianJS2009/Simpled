'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type BoardInvite = {
  id: string;
  boardId: string;
  boardName: string;
  role: string;
  token: string;
  createdAt: string;
};

type TeamInvite = {
  id: string;
  teamId: string;
  teamName: string;
  token: string;
  createdAt: string;
};

type Props = Readonly<{
  onClose: () => void;
}>;

export default function InvitationsModal({ onClose }: Props) {
  const { auth } = useAuth();
  const [boardInvites, setBoardInvites] = useState<BoardInvite[]>([]);
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const API = 'http://localhost:5193';

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.all([
        fetch(`${API}/api/BoardInvitations/user`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
        fetch(`${API}/api/TeamInvitations/user`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
      ]);
      if (!bRes.ok) throw new Error('Tableros');
      if (!tRes.ok) throw new Error('Equipos');
      setBoardInvites(await bRes.json());
      setTeamInvites(await tRes.json());
    } catch {
      toast.error('Error al cargar invitaciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleBoard = async (token: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`${API}/api/BoardInvitations/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        action === 'accept' ? 'Invitación de tablero aceptada' : 'Invitación de tablero rechazada',
      );
      setBoardInvites((prev) => prev.filter((i) => i.token !== token));
    } catch {
      toast.error('Error procesando invitación de tablero.');
    }
  };

  const handleTeam = async (token: string, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`${API}/api/TeamInvitations/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        action === 'accept' ? 'Invitación de equipo aceptada' : 'Invitación de equipo rechazada',
      );
      setTeamInvites((prev) => prev.filter((i) => i.token !== token));
    } catch {
      toast.error('Error procesando invitación de equipo.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="animate-scaleIn sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invitaciones pendientes</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <>
            <section>
              <h3 className="mb-2 text-lg font-medium">Tableros</h3>
              {boardInvites.length === 0 ? (
                <p className="text-muted-foreground text-sm">No tienes invitaciones a tableros.</p>
              ) : (
                <ul className="space-y-4">
                  {boardInvites.map((inv) => (
                    <li
                      key={inv.token}
                      className="flex items-center justify-between rounded border p-4"
                    >
                      <div>
                        <p className="font-medium">{inv.boardName}</p>
                        <p className="text-sm text-gray-500">
                          Rol: {inv.role} • Recibido: {new Date(inv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleBoard(inv.token, 'reject')}
                        >
                          Rechazar
                        </Button>
                        <Button size="sm" onClick={() => handleBoard(inv.token, 'accept')}>
                          Aceptar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section>
              <h3 className="mt-6 mb-2 text-lg font-medium">Equipos</h3>
              {teamInvites.length === 0 ? (
                <p className="text-muted-foreground text-sm">No tienes invitaciones a equipos.</p>
              ) : (
                <ul className="space-y-4">
                  {teamInvites.map((inv) => (
                    <li
                      key={inv.token}
                      className="flex items-center justify-between rounded border p-4"
                    >
                      <div>
                        <p className="font-medium">{inv.teamName}</p>
                        <p className="text-sm text-gray-500">
                          Recibido: {new Date(inv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTeam(inv.token, 'reject')}
                        >
                          Rechazar
                        </Button>
                        <Button size="sm" onClick={() => handleTeam(inv.token, 'accept')}>
                          Aceptar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
