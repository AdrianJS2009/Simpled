'use client';

import { DatePicker } from '@/components/DatePicker';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types';
import { motion } from 'framer-motion';
import { Check, Loader2, Trash2, X } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { toast } from 'react-toastify';

const API = 'http://localhost:5193';

type Props = Readonly<{
  columnId: string;
  onCreated: () => void;
  onClose: () => void;
  assignees: User[];
  userRole?: string;
}>;

export default function ItemCreateModal({
  columnId,
  onClose,
  onCreated,
  assignees,
  userRole,
}: Props) {
  const { auth } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed' | 'delayed'>(
    'pending',
  );
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string }[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Crea una nueva tarea y sus subtareas
  const handleCreate = async () => {
    if (!title.trim()) {
      toast.warning('El título es obligatorio');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim() || null,
        startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
        dueDate: dueDate ? dueDate.toISOString() : null,
        columnId,
        status,
      };
      if (userRole === 'admin' && assigneeId) {
        payload.assigneeId = assigneeId;
      }

      const res = await fetch(`${API}/api/Items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      const createdItem = await res.json();

      for (const subtask of subtasks) {
        await fetch(`${API}/api/items/${createdItem.id}/subtasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            itemId: createdItem.id,
            title: subtask.title,
          }),
        });
      }

      toast.success('Tarea creada');
      onCreated();
      onClose();
    } catch {
      toast.error('Error creando tarea');
    } finally {
      setLoading(false);
    }
  };

  // Añade una subtarea temporal con id único
  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { id: nanoid(), title: newSubtask.trim() }]);
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((sub) => sub.id !== id));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="subtasks">Subtareas ({subtasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 py-4">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Label htmlFor="item-title">Título</Label>
              <Input
                id="item-title"
                placeholder="Título de la tarea"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Label htmlFor="item-description">Descripción</Label>
              <Textarea
                id="item-description"
                placeholder="Descripción de la tarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-2">
                <Label htmlFor="item-startDate">Fecha de inicio</Label>
                <DatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="Fecha inicio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-dueDate">Fecha de vencimiento</Label>
                <DatePicker date={dueDate} onDateChange={setDueDate} placeholder="Fecha fin" />
              </div>
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Label htmlFor="item-status">Estado</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                <SelectTrigger id="item-status">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent className="z-[1200]">
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in-progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="delayed">Retrasada</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {userRole === 'admin' && assignees.length > 0 && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="item-assignee">Asignar a</Label>
                <Select
                  value={assigneeId ?? 'not-assigned'}
                  onValueChange={(value) => setAssigneeId(value === 'not-assigned' ? null : value)}
                >
                  <SelectTrigger id="item-assignee">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent className="z-[1200]">
                    <SelectItem value="not-assigned">Sin asignar</SelectItem>
                    {assignees.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="subtasks" className="py-4">
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-medium">Subtareas</h3>

              {subtasks.length > 0 ? (
                <motion.ul
                  className="scrollbar-thin max-h-[200px] space-y-2 overflow-y-auto pr-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
                >
                  {subtasks.map((subtask, index) => (
                    <motion.li
                      key={subtask.id}
                      className="group flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="border-primary h-4 w-4 flex-shrink-0 rounded-sm border" />
                      <span className="flex-1 text-sm">{subtask.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleRemoveSubtask(subtask.id)}
                      >
                        <Trash2 className="text-muted-foreground h-4 w-4" />
                      </Button>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <motion.p
                  className="text-muted-foreground text-sm italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  No hay subtareas
                </motion.p>
              )}

              <motion.div
                className="flex gap-2 pt-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Input
                  placeholder="Nueva subtarea"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSubtask.trim()) {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  className="text-sm"
                />
                <Button onClick={handleAddSubtask} disabled={!newSubtask.trim()} size="sm">
                  Añadir
                </Button>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center">
                <Loader2 className="mr-2 -ml-1 h-4 w-4 animate-spin" />
                Creando...
              </span>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Crear
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
