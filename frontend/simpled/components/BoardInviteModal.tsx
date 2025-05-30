'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
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
import { Send, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const API = 'http://localhost:5193';

type Props = {
  readonly boardId: string;
  readonly onClose: () => void;
  readonly onInvited: () => void;
};

export default function BoardInviteModal({ boardId, onClose, onInvited }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();

  // Envía la invitación al backend
  const handleInvite = async () => {
    if (!email.trim()) {
      toast.warning('El email es obligatorio.');
      return;
    }

    if (!email.includes('@') || email.split('@')[1].indexOf('.') === -1) {
      toast.warning('Por favor, introduce un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/BoardInvitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ boardId, email: email.trim(), role }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message ?? 'Error al enviar invitación');
      }

      toast.success('Invitación enviada con éxito.');
      onInvited();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar invitación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="animate-scaleIn sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar miembro</DialogTitle>
          <DialogDescription>Envía una invitación para colaborar en este tablero</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email del usuario</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={(value) => setRole(value as any)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent className="z-[1200]">
                <SelectItem value="viewer">Visualizador (Solo ver)</SelectItem>
                <SelectItem value="editor">Editor (Puede editar tareas)</SelectItem>
                <SelectItem value="admin">Administrador (Control total)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleInvite} disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center">
                <svg
                  className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Enviando...
              </span>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Invitar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
