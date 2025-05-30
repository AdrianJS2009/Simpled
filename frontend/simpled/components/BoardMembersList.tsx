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
import { User } from '@/types';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { deleteBoardMember, updateBoardMemberRole } from '../services/boardMemberService';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Lector' },
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

  const handleRoleChange = async (userId: string, newRole: string) => {
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
                        : `http://localhost:5193${user.imageUrl}`
                      : '/images/default/avatar-default.jpg'
                  }
                  alt={user?.name}
                  className="h-8 w-8 rounded-full border object-cover"
                />
                <span className="min-w-0 flex-1 truncate font-medium text-gray-900 dark:text-gray-100">
                  {user?.name || m.userId}
                </span>
                <span className="flex items-center gap-2">
                  {currentUserRole === 'admin' && m.role !== 'owner' ? (
                    <Select
                      value={m.role}
                      onValueChange={(value) => handleRoleChange(m.userId, value)}
                      disabled={loading === m.userId}
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
                    disabled={loading === m.userId}
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
