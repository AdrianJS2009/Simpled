'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTeams } from '@/contexts/TeamsContext';
import { useState } from 'react';
import { toast } from 'react-toastify';

type Props = Readonly<{
  onClose: () => void;
  onCreated: () => void;
}>;

export default function TeamCreateModal({ onClose, onCreated }: Props) {
  const { createTeam } = useTeams();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.warning('El nombre no puede estar vacío.');
      return;
    }

    setLoading(true);
    try {
      await createTeam(name.trim());
      onCreated();
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="animate-scaleIn sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Equipo</DialogTitle>
          <DialogDescription>Crea un nuevo equipo para organizar tus tableros</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="team-name">Nombre</Label>
            <Input
              id="team-name"
              placeholder="Escribe el nombre del equipo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'Creando…' : 'Crear'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
