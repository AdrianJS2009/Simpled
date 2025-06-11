import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL as API } from '@/next.config';
import { User } from '@/types';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { deleteBoardMember, updateBoardMemberRole } from '../services/boardMemberService';

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Visualizador' },
];

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'editor':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export default function BoardMembersList({
  members,
  users,
  currentUserRole,
  boardId,
  onRoleUpdated,
  onMemberRemoved,
}: {
  members: { userId: string; role: string }[];
  users: User[];
  currentUserRole: string;
  boardId: string;
  onRoleUpdated: () => void;
  onMemberRemoved: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const { auth } = useAuth();

  const getUserIdFromToken = (token: string | null): string | null => {
    if (!token) return null;
    try {
      const pl = JSON.parse(atob(token.split('.')[1]));
      return pl['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    } catch {
      return null;
    }
  };

  const currentUserId = getUserIdFromToken(auth.token);
  const isCurrentUserAdmin = currentUserRole === 'admin';
  const isLastAdmin = isCurrentUserAdmin && members.filter((m) => m.role === 'admin').length === 1;
  const isCurrentUser = (userId: string) => currentUserId !== null && userId === currentUserId;

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (isCurrentUser(userId) && isLastAdmin) {
      toast.error('No puedes cambiar tu rol ya que eres el único administrador');
      return;
    }

    setLoading(userId);
    try {
      await updateBoardMemberRole({ boardId, userId, role: newRole, token: auth.token });
      toast.success('Rol actualizado');
      onRoleUpdated();
    } catch (e: any) {
      toast.error('Error actualizando rol');
    } finally {
      setLoading(null);
    }
  };

  const handleRemove = async (userId: string) => {
    if (isCurrentUser(userId) && isLastAdmin) {
      toast.error('No puedes eliminarte ya que eres el único administrador');
      return;
    }

    if (!confirm('¿Eliminar este miembro del tablero?')) return;
    setLoading(userId);
    try {
      await deleteBoardMember(boardId, userId, auth.token);
      toast.success('Miembro eliminado');
      onMemberRemoved();
    } catch {
      toast.error('Error eliminando miembro');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Miembros</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-border divide-y">
          {members.map((m) => {
            const user = users.find((u) => u.id === m.userId);
            const isSelf = isCurrentUser(m.userId);
            const isSelfLastAdmin = isSelf && isLastAdmin;
            return (
              <li
                key={m.userId}
                className="flex flex-col items-center gap-2 px-4 py-3 sm:flex-row sm:gap-4"
              >
                <img
                  src={
                    user?.imageUrl
                      ? user.imageUrl.startsWith('http')
                        ? user.imageUrl
                        : `${API}${user.imageUrl}`
                      : '/images/default/avatar-default.jpg'
                  }
                  alt={user?.name}
                  className="h-8 w-8 rounded-full border object-cover"
                />
                {user?.id && (
                  <Link
                    href={`/perfil/${user.id}`}
                    className="min-w-0 flex-1 truncate font-medium text-gray-900 hover:text-blue-700 hover:underline dark:text-gray-100"
                  >
                    {user.name || m.userId}
                  </Link>
                )}
                {!user?.id && (
                  <span className="min-w-0 flex-1 truncate font-medium text-gray-900 dark:text-gray-100">
                    {m.userId}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  {currentUserRole === 'admin' && m.role !== 'owner' ? (
                    <div className="flex items-center gap-2">
                      <Select
                        value={m.role}
                        onValueChange={(value) => handleRoleChange(m.userId, value)}
                        disabled={loading === m.userId || isSelfLastAdmin}
                      >
                        <SelectTrigger className="w-28" title="Seleccionar rol">
                          <SelectValue placeholder="Rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isSelfLastAdmin && (
                        <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                          <AlertCircle className="h-4 w-4" />
                          <span>Último admin</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Badge className={getRoleBadgeColor(m.role)}>
                      {ROLES.find((r) => r.value === m.role)?.label || m.role}
                    </Badge>
                  )}
                </span>
                {currentUserRole === 'admin' && m.role !== 'owner' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive font-semibold"
                    disabled={loading === m.userId || isSelfLastAdmin}
                    onClick={() => handleRemove(m.userId)}
                  >
                    Eliminar
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
