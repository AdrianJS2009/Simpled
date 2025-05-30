'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useTeams } from '@/contexts/TeamsContext';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import ChatPanel from './ChatPanel';

const getRoleBadgeColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'leader':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

const getRoleLabel = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'Administrador';
    case 'leader':
      return 'Líder';
    case 'editor':
      return 'Editor';
    case 'viewer':
      return 'Visualizador';
    default:
      return role;
  }
};

type Member = { userId: string; userName: string; role: string };

interface Props {
  readonly team: {
    readonly id: string;
    readonly name: string;
    readonly ownerId: string;
    readonly ownerName?: string;
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
    { userId: string; name: string; imageUrl?: string; role: string }[]
  >([]);
  const [roleUpdates, setRoleUpdates] = useState<{ [userId: string]: string }>({});

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
            role: m.role,
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

  // Owner como primer miembro
  const ownerMember = {
    userId: team.ownerId,
    name: team.ownerName || 'Propietario',
    imageUrl: enrichedMembers.find((m) => m.userId === team.ownerId)?.imageUrl,
    role: 'Propietario',
  };
  const otherMembers = enrichedMembers.filter((m) => m.userId !== team.ownerId);
  const totalMiembros = 1 + otherMembers.length;

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

  // Cambiar rol de miembro (solo owner)
  const handleRoleChange = async (userId: string, newRole: string) => {
    setRoleUpdates((prev) => ({ ...prev, [userId]: newRole }));
    setProcessing(true);
    try {
      // Aquí deberías llamar a tu servicio para actualizar el rol en el backend
      // await updateTeamMemberRole(team.id, userId, newRole);
      // Simulación de éxito:
      toast.success('Rol actualizado');
      onUpdated();
    } catch {
      toast.error('No se pudo actualizar el rol');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="animate-scaleIn flex flex-col gap-6 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {team.name}
            <span className="text-muted-foreground ml-2 text-base font-normal">
              ({totalMiembros} miembro{totalMiembros !== 1 ? 's' : ''})
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Sección miembros */}
          <div className="min-w-0 flex-1">
            <h3 className="mb-2 text-lg font-semibold">Miembros del equipo</h3>
            <ul className="divide-y divide-gray-200 rounded-lg border bg-gray-50 dark:bg-gray-900">
              {/* Owner */}
              <li className="flex items-center gap-3 px-4 py-3">
                <Avatar>
                  <AvatarImage src={ownerMember.imageUrl} alt={ownerMember.name} />
                  <AvatarFallback>{ownerMember.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <span className="font-medium">{ownerMember.name}</span>
                  <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                    Propietario
                  </span>
                </div>
              </li>
              {/* Otros miembros */}
              {otherMembers.length === 0 && (
                <li className="text-muted-foreground px-4 py-3 text-sm">
                  No hay más miembros en este equipo.
                </li>
              )}
              {otherMembers.map((m) => (
                <li
                  key={m.userId}
                  className="group flex items-center gap-3 px-4 py-3 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Avatar>
                    <AvatarImage src={m.imageUrl} alt={m.name} />
                    <AvatarFallback>{m.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{m.name}</span>
                    {isOwner && m.userId !== team.ownerId ? (
                      <div className="flex items-center gap-2">
                        <Select
                          defaultValue={m.role}
                          onValueChange={(value) => handleRoleChange(m.userId, value)}
                          disabled={processing}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemove(m.userId)}
                          disabled={processing}
                          title="Eliminar miembro"
                        >
                          Eliminar
                        </Button>
                      </div>
                    ) : (
                      <span
                        className={`ml-2 rounded px-2 py-0.5 text-xs font-semibold ${getRoleBadgeColor(m.role)}`}
                      >
                        {getRoleLabel(m.role)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {/* Sección de invitación */}
            {isOwner && (
              <div className="mt-6 border-t pt-4">
                <h3 className="mb-2 text-lg font-semibold">Invitar por correo</h3>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <Label htmlFor="invite-email">Correo electrónico</Label>
                    <div className="mb-1" />
                    <Input
                      id="invite-email"
                      placeholder="usuario@dominio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={processing}
                    />
                  </div>
                  <Button onClick={handleInvite} disabled={processing} className="mt-2 sm:mt-0">
                    {processing ? 'Enviando…' : 'Invitar'}
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Chat lateral */}
          <div className="flex min-h-[500px] w-full flex-col rounded-lg border bg-white p-2 md:w-[380px] dark:bg-gray-900">
            <ChatPanel roomType="Team" entityId={team.id} members={enrichedMembers} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
