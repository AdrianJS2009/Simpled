'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useTeams } from '@/contexts/TeamsContext';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ChatPanel from './ChatPanel';

type Member = { userId: string; userName: string; role: string };

interface Props {
  readonly team: {
    readonly id: string;
    readonly name: string;
    readonly ownerId: string;
    readonly members: readonly Member[];
  };
  readonly isOwner: boolean;
  readonly onClose: () => void;
  readonly onUpdated: () => void;
}

export default function TeamDetailModal({ team, isOwner, onClose, onUpdated }: Props) {
  const { inviteToTeam, removeMember } = useTeams();
  const { fetchUserProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [enrichedMembers, setEnrichedMembers] = useState<
    { userId: string; name: string; imageUrl?: string }[]
  >([]);

  // Cargar datos de perfil de los miembros al abrir el modal
  useEffect(() => {
    let mounted = true;
    const loadProfiles = async () => {
      const results = await Promise.all(
        team.members.map(async (m) => {
          const profile = await fetchUserProfile(m.userId);
          return {
            userId: m.userId,
            name: m.userName,
            imageUrl: profile?.imageUrl || undefined,
          };
        }),
      );
      if (mounted) setEnrichedMembers(results);
    };
    loadProfiles();
    return () => {
      mounted = false;
    };
  }, [team.members, fetchUserProfile]);

  const handleInvite = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      toast.warning('Escribe un correo válido.');
      return;
    }

    setProcessing(true);
    try {
      await inviteToTeam(team.id, trimmed);
      setEmail('');
      onUpdated();
    } catch {
    } finally {
      setProcessing(false);
    }
  };

  const handleRemove = async (userId: string) => {
    setProcessing(true);
    try {
      await removeMember(team.id, userId);
      onUpdated();
    } catch {
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="animate-scaleIn flex flex-row gap-6 sm:max-w-3xl">
        <div className="min-w-0 flex-1">
          <DialogHeader>
            <DialogTitle>{team.name}</DialogTitle>
          </DialogHeader>

          <div className="mb-4 space-y-2">
            <h3 className="font-medium">Miembros actuales</h3>
            <ul className="space-y-1">
              {team.members.map((m) => (
                <li key={m.userId} className="flex items-center justify-between">
                  <span>
                    {m.userName} ({m.role})
                  </span>
                  {isOwner && m.userId !== team.ownerId && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(m.userId)}
                      disabled={processing}
                    >
                      Eliminar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {isOwner && (
            <div className="space-y-3">
              <h3 className="font-medium">Invitar por correo</h3>
              <div>
                <Label htmlFor="invite-email">Correo</Label>
                <Input
                  id="invite-email"
                  placeholder="usuario@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={processing}
                />
              </div>
              <DialogFooter>
                <Button onClick={handleInvite} disabled={processing}>
                  {processing ? 'Enviando…' : 'Invitar'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
        <div className="flex min-h-[500px] w-[380px] flex-col border-l pl-4">
          <ChatPanel roomType="Team" entityId={team.id} members={enrichedMembers} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
