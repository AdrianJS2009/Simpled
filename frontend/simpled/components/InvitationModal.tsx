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
import { useInvitations } from '@/contexts/InvitationsContext';
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
  const {
    boardInvites,
    teamInvites,
    loading,
    removeBoardInvite,
    removeTeamInvite,
    refreshInvites,
  } = useInvitations();
  const API = 'http://localhost:5193';

  const handleBoard = async (token: string, action: 'accept' | 'reject') => {
    try {
      const inv = boardInvites.find((i) => i.token === token);
      const res = await fetch(`${API}/api/BoardInvitations/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error();
      removeBoardInvite(token);
      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-xl text-green-600"></span>
          <span>
            Invitación a <b>{inv?.boardName ?? 'tablero'}</b>{' '}
            {action === 'accept' ? 'aceptada' : 'rechazada'}
          </span>
        </div>,
        { autoClose: 2500 },
      );
    } catch {
      toast.error('Error procesando invitación de tablero.');
    }
  };

  const handleTeam = async (token: string, action: 'accept' | 'reject') => {
    try {
      const inv = teamInvites.find((i) => i.token === token);
      const res = await fetch(`${API}/api/TeamInvitations/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error();
      removeTeamInvite(token);
      toast.success(
        <div className="flex items-center gap-2">
          <span className="text-xl text-green-600"></span>
          <span>
            Invitación a <b>{inv?.teamName ?? 'equipo'}</b>{' '}
            {action === 'accept' ? 'aceptada' : 'rechazada'}
          </span>
        </div>,
        { autoClose: 2500 },
      );
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
