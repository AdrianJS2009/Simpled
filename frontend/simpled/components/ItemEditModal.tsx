// src/components/ItemEditModal.tsx
'use client';

import { ActivityLogComponent } from '@/components/ActivityLog';
import { CommentSection } from '@/components/CommentSection';
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
import * as activityLogService from '@/services/activityLogService';
import * as commentService from '@/services/commentService';
import type { ActivityLog, Comment, Item, Subtask, User } from '@/types';
import { Check, Loader2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import SubtaskList from './SubtaskList';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5193';

type Props = Readonly<{
  item: Item;
  onClose: () => void;
  onUpdated: () => void;
  assignees: User[];
  userRole?: string;
  currentUserId: string;
}>;

export default function ItemEditModal({
  item,
  onClose,
  onUpdated,
  assignees,
  userRole,
  currentUserId,
}: Props) {
  const { auth } = useAuth();

  // Detalles de la tarea
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description ?? '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    item.startDate ? new Date(item.startDate) : undefined,
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    item.dueDate ? new Date(item.dueDate) : undefined,
  );
  const [status, setStatus] = useState(item.status ?? 'pending');
  const [assigneeId, setAssigneeId] = useState(item.assigneeId ?? '');

  // Subtareas
  const [subtasks, setSubtasks] = useState<Subtask[]>(item.subtasks || []);

  // Comentarios
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Actividad
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // UI
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments' | 'activity'>(
    'details',
  );
  const [loading, setLoading] = useState(false);

  const canChangeAll = userRole === 'admin';
  const canChangeDates = canChangeAll || item.assigneeId === currentUserId;
  const canChangeStatus = canChangeAll || item.assigneeId === currentUserId;

  useEffect(() => {
    // Fetch subtasks
    const fetchSubtasks = async () => {
      try {
        const res = await fetch(`${API}/api/items/${item.id}/subtasks`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (res.ok) {
          setSubtasks(await res.json());
        }
      } catch (err) {
        console.error('Error fetching subtasks:', err);
        toast.error('Error al cargar subtareas');
      }
    };

    // Fetch comments
    const fetchComments = async () => {
      if (!auth.token) {
        toast.error('No autenticado');
        setIsLoadingComments(false);
        return;
      }
      setIsLoadingComments(true);
      try {
        const data = await commentService.fetchComments(item.id, auth.token);
        setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
        toast.error('Error al cargar los comentarios');
      } finally {
        setIsLoadingComments(false);
      }
    };

    // Fetch activity logs
    const fetchActivityLogs = async () => {
      if (!auth.token) {
        toast.error('No autenticado');
        setIsLoadingLogs(false);
        return;
      }
      setIsLoadingLogs(true);
      try {
        const data = await activityLogService.fetchActivityLogs(item.id, auth.token);
        console.log('Activity logs for item', item.id, data);
        setActivityLogs(data);
      } catch (err) {
        console.error('Error fetching activity logs:', err);
        toast.error('Error al cargar el historial de actividad');
      } finally {
        setIsLoadingLogs(false);
      }
    };

    fetchSubtasks();
    fetchComments();
    fetchActivityLogs();
  }, [item.id, auth.token]);

  // Guardar cambios de la tarea
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('El título es obligatorio');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        id: item.id,
        title,
        description,
        startDate: startDate ? startDate.toISOString() : null,
        dueDate: dueDate ? dueDate.toISOString() : null,
        columnId: item.columnId,
        status,
      };
      if (canChangeAll) {
        payload.assigneeId = assigneeId || null;
      }

      const res = await fetch(`${API}/api/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al actualizar');
      toast.success('Tarea actualizada');
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating item:', err);
      toast.error('Error actualizando tarea');
    } finally {
      setLoading(false);
    }
  };

  // Handlers de subtareas
  const handleAddSubtask = async (title: string) => {
    try {
      const res = await fetch(`${API}/api/items/${item.id}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ itemId: item.id, title }),
      });
      if (!res.ok) throw new Error('Error al crear subtarea');
      const newSubtask = await res.json();
      setSubtasks((prev) => [...prev, newSubtask]);
      toast.success('Subtarea añadida');
    } catch (err) {
      console.error(err);
      toast.error('Error al crear subtarea');
    }
  };

  const handleUpdateSubtask = async (subtask: Subtask) => {
    try {
      const res = await fetch(`${API}/api/items/${item.id}/subtasks/${subtask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          id: subtask.id,
          itemId: item.id,
          title: subtask.title,
          isCompleted: subtask.isCompleted,
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar subtarea');
      setSubtasks((prev) => prev.map((st) => (st.id === subtask.id ? subtask : st)));

      const all = subtasks.length;
      const done = subtasks.filter((st) =>
        st.id === subtask.id ? subtask.isCompleted : st.isCompleted,
      ).length;
      if (all > 0 && done === all) setStatus('completed');
      else if (done > 0) setStatus('in-progress');
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar subtarea');
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const res = await fetch(`${API}/api/items/${item.id}/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar subtarea');
      setSubtasks((prev) => prev.filter((st) => st.id !== subtaskId));
      toast.success('Subtarea eliminada');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar subtarea');
    }
  };

  // Handlers de comentarios
  const handleAddComment = async (text: string) => {
    if (!auth.token) {
      toast.error('No autenticado');
      return;
    }
    try {
      const newComment = await commentService.addComment(item.id, text, auth.token);
      setComments((prev) => [newComment, ...prev]);
    } catch {
      toast.error('Error al añadir comentario');
    }
  };

  const handleUpdateComment = async (commentId: string, text: string) => {
    if (!auth.token) {
      toast.error('No autenticado');
      return;
    }
    try {
      const updated = await commentService.updateComment(commentId, item.id, text, auth.token);
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
    } catch {
      toast.error('Error al editar comentario');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!auth.token) {
      toast.error('No autenticado');
      return;
    }
    try {
      await commentService.deleteComment(commentId, item.id, auth.token);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      toast.error('Error al eliminar comentario');
    }
  };

  const handleResolveComment = async (commentId: string, isResolved: boolean) => {
    if (!auth.token) {
      toast.error('No autenticado');
      return;
    }
    try {
      await commentService.resolveComment(commentId, item.id, isResolved, auth.token);
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, isResolved } : c)));
    } catch {
      toast.error('Error al cambiar estado de comentario');
    }
  };

  function getActivityMessage(log: ActivityLog) {
    switch (log.type) {
      case 'Created':
        return `Tarea creada por ${log.userName}`;
      case 'Updated':
        return log.field
          ? `${log.userName} actualizó ${log.field}: '${log.oldValue}' → '${log.newValue}'`
          : `${log.userName} actualizó la tarea`;
      case 'StatusChanged':
        return `${log.userName} cambió el estado: '${log.oldValue}' → '${log.newValue}'`;
      case 'Assigned':
        return `${log.userName} cambió el responsable: '${log.oldValue}' → '${log.newValue}'`;
      case 'DateChanged':
        return `${log.userName} cambió la fecha: '${log.oldValue}' → '${log.newValue}'`;
      case 'Deleted':
        return `${log.userName} eliminó la tarea`;
      case 'FileUploaded':
        return `${log.userName} subió un archivo: ${log.details}`;
      case 'SubtaskCreated':
        return `${log.userName} creó una subtarea: ${log.details}`;
      case 'SubtaskUpdated':
        return `${log.userName} actualizó una subtarea: ${log.details}`;
      case 'SubtaskDeleted':
        return `${log.userName} eliminó una subtarea`;
      case 'CommentAdded':
        return `${log.userName} añadió un comentario: ${log.details}`;
      case 'CommentEdited':
        return `${log.userName} editó un comentario: ${log.details}`;
      case 'CommentDeleted':
        return `${log.userName} eliminó un comentario`;
      case 'CommentResolved':
        return `${log.userName} resolvió un comentario`;
      default:
        return `${log.userName} realizó una acción`;
    }
  }

  let activityContent;
  if (isLoadingLogs) {
    activityContent = (
      <div className="flex justify-center py-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  } else if (activityLogs.length) {
    activityContent = <ActivityLogComponent logs={activityLogs} />;
  } else {
    activityContent = (
      <p className="text-muted-foreground text-center text-sm">Sin actividad registrada</p>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="animate-scaleIn max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Tarea</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="subtasks">Subtareas ({subtasks.length})</TabsTrigger>
            <TabsTrigger value="comments">Comentarios ({comments.length})</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          {/* Detalles */}
          <TabsContent value="details" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-title">Título</Label>
              <Input
                id="item-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canChangeAll}
                placeholder="Título de la tarea"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-description">Descripción</Label>
              <Textarea
                id="item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canChangeAll}
                placeholder="Descripción de la tarea"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-startDate">Fecha de inicio</Label>
                <DatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="Fecha inicio"
                  disabled={!canChangeDates}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-dueDate">Fecha de vencimiento</Label>
                <DatePicker
                  date={dueDate}
                  onDateChange={setDueDate}
                  placeholder="Fecha fin"
                  disabled={!canChangeDates}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-status">Estado</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as any)}
                disabled={!canChangeStatus}
              >
                <SelectTrigger id="item-status">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-amber-500" /> Pendiente
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-blue-500" /> En progreso
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500" /> Completada
                    </div>
                  </SelectItem>
                  <SelectItem value="delayed">
                    <div className="flex items-center">
                      <span className="mr-2 h-2 w-2 rounded-full bg-rose-500" /> Retrasada
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {canChangeAll && (
              <div className="space-y-2">
                <Label htmlFor="item-assignee">Asignar a</Label>
                <Select
                  value={assigneeId || 'not_assigned'}
                  onValueChange={(v) => setAssigneeId(v === 'not_assigned' ? '' : v)}
                >
                  <SelectTrigger id="item-assignee">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_assigned">Sin asignar</SelectItem>
                    {assignees.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>

          {/* Subtareas */}
          <TabsContent value="subtasks" className="py-4">
            <SubtaskList
              subtasks={subtasks}
              itemId={item.id}
              onAdd={handleAddSubtask}
              onUpdate={handleUpdateSubtask}
              onDelete={handleDeleteSubtask}
              disabled={!canChangeStatus}
            />
          </TabsContent>

          {/* Comentarios */}
          <TabsContent value="comments" className="py-4">
            {isLoadingComments ? (
              <div className="flex justify-center py-8">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
              </div>
            ) : (
              <CommentSection
                itemId={item.id}
                comments={comments}
                onAddComment={handleAddComment}
                onUpdateComment={handleUpdateComment}
                onDeleteComment={handleDeleteComment}
                onResolveComment={handleResolveComment}
              />
            )}
          </TabsContent>

          {/* Actividad */}
          <TabsContent value="activity" className="py-4">
            {activityContent}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex pt-4 sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !canChangeStatus}>
            {loading ? (
              <span className="inline-flex items-center">
                <Loader2 className="mr-2 -ml-1 h-4 w-4 animate-spin" />
                Guardando...
              </span>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
